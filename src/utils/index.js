/**
 * isValue decides if a value is a value
 *
 * @param {any} value is an item to get the value of
 *
 * @returns {boolean} if it's a value or not
 */
export const isValue = value => !(value === undefined || value === null || value.length === 0)

/**
 * getValue gets a value or returns the emptyReturn
 *
 * @param {any} value is an item to get the value of
 * @param {any} emptyReturn is the value to return if value is null or undefined
 *
 * @returns {any} value or emptyReturn
 */
export const getValue = (value, emptyReturn) => (isValue(value) ? value : emptyReturn)
