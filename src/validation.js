import { isValue } from './utils'

const regex = {
  isNumber: /^[0-9]+(\.[0-9]+)*$/,
  isEmail: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  isHttp: /(http(s?))\:\/\//gi,
  isUrl: /^(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i
}

const minLength = (n, value, label = 'Field') =>
  value.length < n ? [label, 'must be at least', n + ' characters'] : false

const maxLength = (n, value, label = 'Field') =>
  value.length > n ? [label, 'must be fewer than', n + ' characters'] : false

const length = (n, value, label = 'Field') =>
  value.length !== n ? [label, 'must be', n + ' characters'] : false

const numberLength = (n, value, label = 'Field') =>
  value.length > 0 && (value.length !== n || !regex.isNumber.test(value))
    ? [label, 'must be', n + ' digits']
    : false

const required = (value, label = 'Field') =>
  value === null || value === undefined || value.length === 0 ? [label, 'is required'] : false

const isNumber = (value, label = 'Field') =>
  !regex.isNumber.test(value) ? [label, 'must be a number'] : false

const isEmail = value =>
  isValue(value) && !regex.isEmail.test(value) ? 'Invalid email syntax' : false

const isUrl = value =>
  !isValue(value)
    ? false
    : regex.isHttp.test(value)
      ? ['Invalid syntax.', 'Do not include \'http\' in the URL']
      : !regex.isUrl.test(value)
        ? 'Invalid URL syntax'
        : false

const cantStartWith = (cantValue, value, label = 'Field') =>
  isValue(value) && value.startsWith(cantValue) ? [label, 'can\'t begin with', cantValue] : false

const hasNoSpaces = (value, label = 'Field') =>
  isValue(value) && /\s/.test(value) ? [label, 'may not contain spaces'] : false

const isMatching = (field, value, label, formState) =>
  isValue(value) && value !== formState[field].value ? [label, 'doesn\'t match'] : false

const isUnique = (field, value, label, formState) =>
  isValue(value) && value === formState[field].value ? [label, 'must be unique'] : false

const isValidated = (formState, field) => {
  const fieldState = formState[field]
  return isValue(fieldState.value) && fieldState.errors.length === 0
}

const cleanseNonDigits = value => value.replace(/[^\d]/g, '')
const cleanseNonAlphaDashesSpaces = value => value.replace(/[^a-zA-Z\-\s]/g, '')
const cleanseMaxLength = (n, value) => value.substring(0, n)
const cleanseNonFloatNumbers = value => value.replace(/[^\d][^\d.?][^\d]*/g, '')
const cleansePositiveFloatNumbers = value => {
  const cleansedValue = cleanseNonFloatNumbers(value)
  const decimalVal = cleansedValue.startsWith('.') ? '0' + cleansedValue : cleansedValue
  const splits = decimalVal.replace(/[^\d\\.]/g, '').split('.')
  const allDigitsAfterDecimal = splits.splice(0, 2).join('.') + splits.join('')
  // truncate after 2 decimals:
  return allDigitsAfterDecimal
    ? allDigitsAfterDecimal.match(/^-?\d+(?:\.\d{0,2})?/)[0]
    : allDigitsAfterDecimal
}

export const validate = {
  minLength: n => (value, label) => minLength(n, value, label),
  maxLength: n => (value, label) => maxLength(n, value, label),
  length: n => (value, label) => length(n, value, label),
  isNumberLength: n => (value, label) => numberLength(n, value, label),
  isNumber: (value, label) => isNumber(value, label),
  required: (value, label) => required(value, label),
  isEmail: value => isEmail(value),
  isUrl: value => isUrl(value),
  cantStartWith: cant => (value, label) => cantStartWith(cant, value, label),
  noSpaces: (value, label) => hasNoSpaces(value, label),
  fieldMatches: field => (value, label, formState) => isMatching(field, value, label, formState),
  fieldUnique: field => (value, label, formState) => isUnique(field, value, label, formState),

  // pretests:
  fieldValidated: field => formState => isValidated(formState, field)
}

export const allow = {
  numbers: value => isNumber(value),
  maxLength: n => value => maxLength(n, value)
}

export const retain = {
  digits: value => cleanseNonDigits(value),
  alphaDashesSpaces: value => cleanseNonAlphaDashesSpaces(value),
  maxLength: n => value => cleanseMaxLength(n, value),
  floatNumbers: value => cleanseNonFloatNumbers(value),
  positiveFloatNumbers: value => cleansePositiveFloatNumbers(value)
}
