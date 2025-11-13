/**
 * Data validation functions for API responses
 */

/**
 * Validate that a value exists and is not null/undefined
 * @param {*} value - Value to check
 * @param {string} fieldName - Field name for error messages
 * @throws {Error} If value is null or undefined
 */
function required(value, fieldName) {
  if (value === null || value === undefined) {
    throw new Error(`Missing required field: ${fieldName}`);
  }
}

/**
 * Validate that a value is a non-empty string
 * @param {*} value - Value to check
 * @param {string} fieldName - Field name for error messages
 * @throws {Error} If value is not a non-empty string
 */
function nonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

/**
 * Validate an Item object from the API
 * @param {Object} item - Item to validate
 * @throws {Error} If item is invalid
 */
export function validateItem(item) {
  required(item, 'item');
  required(item.id, 'item.id');
  required(item.name, 'item.name');
  required(item.item_type, 'item.item_type');

  nonEmptyString(item.id, 'item.id');
  nonEmptyString(item.name, 'item.name');
  nonEmptyString(item.item_type, 'item.item_type');

  // Rarity is optional for cosmetic items
  if (item.rarity !== undefined && item.rarity !== null && item.rarity !== '') {
    nonEmptyString(item.rarity, 'item.rarity');
  }

  // Validate optional arrays if present
  if (item.components !== undefined && !Array.isArray(item.components)) {
    throw new Error('item.components must be an array');
  }

  if (item.used_in !== undefined && !Array.isArray(item.used_in)) {
    throw new Error('item.used_in must be an array');
  }

  if (item.recycle_components !== undefined && !Array.isArray(item.recycle_components)) {
    throw new Error('item.recycle_components must be an array');
  }

  if (item.recycle_from !== undefined && !Array.isArray(item.recycle_from)) {
    throw new Error('item.recycle_from must be an array');
  }
}

/**
 * Validate a Quest object from the API
 * @param {Object} quest - Quest to validate
 * @throws {Error} If quest is invalid
 */
export function validateQuest(quest) {
  required(quest, 'quest');
  required(quest.id, 'quest.id');
  required(quest.name, 'quest.name');

  nonEmptyString(quest.id, 'quest.id');
  nonEmptyString(quest.name, 'quest.name');

  if (quest.objectives !== undefined && !Array.isArray(quest.objectives)) {
    throw new Error('quest.objectives must be an array');
  }

  if (quest.rewards !== undefined && !Array.isArray(quest.rewards)) {
    throw new Error('quest.rewards must be an array');
  }

  if (quest.required_items !== undefined && !Array.isArray(quest.required_items)) {
    throw new Error('quest.required_items must be an array');
  }
}

/**
 * Validate an ARC object from the API
 * @param {Object} arc - ARC to validate
 * @throws {Error} If arc is invalid
 */
export function validateARC(arc) {
  required(arc, 'arc');
  required(arc.id, 'arc.id');
  required(arc.name, 'arc.name');

  nonEmptyString(arc.id, 'arc.id');
  nonEmptyString(arc.name, 'arc.name');
}

/**
 * Validate a Trader item object from the API
 * @param {Object} item - Trader item to validate
 * @throws {Error} If item is invalid
 */
export function validateTraderItem(item) {
  required(item, 'traderItem');
  required(item.id, 'traderItem.id');
  required(item.name, 'traderItem.name');
  required(item.rarity, 'traderItem.rarity');

  nonEmptyString(item.id, 'traderItem.id');
  nonEmptyString(item.name, 'traderItem.name');
  nonEmptyString(item.rarity, 'traderItem.rarity');
}

/**
 * Validate an array of items
 * @param {Array} items - Items to validate
 * @param {Function} validator - Validation function
 * @param {string} typeName - Type name for error messages
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
function validateArray(items, validator, typeName) {
  if (!Array.isArray(items)) {
    return {
      valid: false,
      errors: [`Expected array of ${typeName}, got ${typeof items}`],
    };
  }

  const errors = [];

  items.forEach((item, index) => {
    try {
      validator(item);
    } catch (error) {
      errors.push(`${typeName}[${index}] (id: ${item?.id || 'unknown'}): ${error.message}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate items array
 * @param {Array} items - Items to validate
 * @returns {Object} Validation result
 */
export function validateItems(items) {
  return validateArray(items, validateItem, 'Item');
}

/**
 * Validate quests array
 * @param {Array} quests - Quests to validate
 * @returns {Object} Validation result
 */
export function validateQuests(quests) {
  return validateArray(quests, validateQuest, 'Quest');
}

/**
 * Validate ARCs array
 * @param {Array} arcs - ARCs to validate
 * @returns {Object} Validation result
 */
export function validateARCs(arcs) {
  return validateArray(arcs, validateARC, 'ARC');
}

/**
 * Validate traders object
 * @param {Object} traders - Traders object with vendor names as keys
 * @returns {Object} Validation result
 */
export function validateTraders(traders) {
  if (typeof traders !== 'object' || traders === null) {
    return {
      valid: false,
      errors: [`Expected traders object, got ${typeof traders}`],
    };
  }

  const errors = [];

  Object.entries(traders).forEach(([vendor, items]) => {
    if (!Array.isArray(items)) {
      errors.push(`Trader '${vendor}' must have an array of items`);
      return;
    }

    items.forEach((item, index) => {
      try {
        validateTraderItem(item);
      } catch (error) {
        errors.push(`Trader '${vendor}'[${index}] (id: ${item?.id || 'unknown'}): ${error.message}`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
