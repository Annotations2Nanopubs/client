/**
 * Type conversion methods that coerce incoming configuration values to an
 * expected type or format that other parts of the UI may make assumptions
 * on. This is needed for incoming configuration values that are otherwise
 * not sanitized.
 *
 * Note that if the values passed are plain javascript values (such as ones
 * produced from JSON.parse), then these methods do not throw errors.
 */

/**
 * Returns the value as a string or an empty string if the
 * value undefined, null or otherwise falsely.
 *
 * @param {any} value - Initial value
 * @return {string}
 */
function toStringShim(value) {
  if (value && typeof value.toString === 'function') {
    return value.toString();
  }
  return '';
}

toStringShim.orNull = value => (value === null ? null : toStringShim(value))

/**
 * Returns either an integer or NaN.
 *
 * @param {any} value - Initial value
 * @return {number}
 */
function toIntegerShim(value) {
  return parseInt(value);
}

/**
 * Returns either an integer or null.
 *
 * @type {(value: any) => number|null}
 */
toIntegerShim.orNull = value => (value === null ? null : toIntegerShim(value))


/**
 * Returns either the value if its an object or an empty object.
 *
 * @param {any} value - Initial value
 * @return {Object}
 */
function toObjectShim(value) {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  // Don't attempt to fix the values, just ensure type correctness
  return {};
}

/**
 * Returns either an object or null.
 *
 * @type {(value: any) => Object|null}
 */
toObjectShim.orNull = value => (value === null ? null : toObjectShim(value))


/**
 * Returns either the value if its an object or an empty object.
 *
 * @param {(value: any) => Object} shape - Custom coercion function
 * @return {Object}
 */
toObjectShim.shape = (shape) => {
  /**
   * Custom object shim. Returns either an object or null
   *
   * @param {any} value - Initial value
   */
  function toObjectShapeShim(value) {
    return shape(toObjectShim(value));
  }
  /**
   * Returns either an object or null
   *
   * @type {(value: any) => Object|null}
   */
  toObjectShapeShim.orNull = value => (value === null ? null : toObjectShapeShim(value))
  return toObjectShapeShim;
};

/**
 * Returns a boolean.
 *
 * @param {any} value - initial value
 * @return {boolean}
 */
function toBooleanShim(value) {
  if (typeof value === 'string') {
    if (value.trim().toLocaleLowerCase() === 'false') {
      // "false", "False", " false", "FALSE" all return false
      return false;
    }
  }
  const numericalVal = Number(value);
  if (!isNaN(numericalVal)) {
    return Boolean(numericalVal);
  }
  // Any non numerical or falsely string should return true, otherwise return false
  return typeof value === 'string';
}

/**
 * Returns either an boolean or null.
 *
 * @type {(value: any) => boolean|null}
 */
toBooleanShim.orNull = value => (value === null ? null : toBooleanShim(value))

// Exported coercion types
export const coercions = {
  toString: toStringShim,
  toInteger: toIntegerShim,
  toObject: toObjectShim,
  toBoolean: toBooleanShim,
}

