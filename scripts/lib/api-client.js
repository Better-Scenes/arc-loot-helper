import https from 'https';

const BASE_URL = 'https://metaforge.app/api/arc-raiders';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

/**
 * Makes an HTTPS GET request with timeout
 * @param {string} url - The URL to fetch
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<string>} Response body
 */
function httpsGet(url, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';

      // Handle non-200 status codes
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    // Set timeout
    request.setTimeout(timeout, () => {
      request.destroy();
      reject(new Error(`Request timeout after ${timeout}ms`));
    });
  });
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch data with retry logic and exponential backoff
 * @param {string} url - The URL to fetch
 * @param {number} retries - Number of retries remaining
 * @returns {Promise<string>} Response body
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  try {
    return await httpsGet(url);
  } catch (error) {
    // Don't retry on 4xx errors (client errors)
    if (error.message.match(/HTTP 4\d\d/)) {
      throw error;
    }

    if (retries > 0) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, MAX_RETRIES - retries);
      console.log(`  Retry in ${delay}ms... (${retries} attempts remaining)`);
      await sleep(delay);
      return fetchWithRetry(url, retries - 1);
    }

    throw error;
  }
}

/**
 * Fetch all pages from a paginated API endpoint
 * @param {string} endpoint - API endpoint path (e.g., '/items')
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Items per page (default: 50, max: 100)
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Array>} All items from all pages
 */
export async function fetchPaginated(endpoint, params = {}, additionalParams = {}) {
  const limit = params.limit || 50;
  const queryParams = { ...additionalParams, limit };

  let allData = [];
  let page = 1;
  let totalPages = null;

  console.log(`Fetching ${endpoint}...`);

  while (true) {
    // Build query string
    const query = new URLSearchParams({ ...queryParams, page }).toString();
    const url = `${BASE_URL}${endpoint}?${query}`;

    try {
      const responseBody = await fetchWithRetry(url);
      const response = JSON.parse(responseBody);

      // Validate response structure
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid API response: missing data array');
      }

      if (!response.pagination) {
        throw new Error('Invalid API response: missing pagination info');
      }

      // Add data from this page
      allData = allData.concat(response.data);

      // Update total pages on first request
      if (totalPages === null) {
        totalPages = response.pagination.totalPages;
        console.log(`  Total pages: ${totalPages} (${response.pagination.total} items)`);
      }

      console.log(`  Page ${page}/${totalPages} fetched (${response.data.length} items)`);

      // Check if we have more pages
      if (!response.pagination.hasNextPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`  Error fetching page ${page}: ${error.message}`);
      throw error;
    }
  }

  console.log(`✓ Fetched ${allData.length} items from ${endpoint}`);
  return allData;
}

/**
 * Fetch a single endpoint without pagination
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<Object>} Response data
 */
export async function fetchSingle(endpoint) {
  const url = `${BASE_URL}${endpoint}`;

  console.log(`Fetching ${endpoint}...`);

  try {
    const responseBody = await fetchWithRetry(url);
    const response = JSON.parse(responseBody);

    console.log(`✓ Fetched ${endpoint}`);
    return response;
  } catch (error) {
    console.error(`  Error fetching ${endpoint}: ${error.message}`);
    throw error;
  }
}

export { BASE_URL, DEFAULT_TIMEOUT, MAX_RETRIES };
