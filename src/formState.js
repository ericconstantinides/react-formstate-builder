import { getValue, isValue } from './utils'

export const initializeFormState = (formInfo, defaultValues = {}) => {
  const formState = Object.keys(formInfo).reduce(
    (formState, field) => {
      formState[field] = {
        field,
        value: getValue(defaultValues[field], ''),
        defaultValue: getValue(defaultValues[field], ''),
        fieldChanged: false,
        required:
          formInfo[field].validate &&
          formInfo[field].validate.tests &&
          formInfo[field].validate.tests.some(fn => fn.name === 'required')
            ? true
            : false,
        errors: [],
        showValidation: ''
      }
      return formState
    },
    {
      _formEvent: 'onLoad',
      _fieldsWithErrors: 0,
      _fieldsWithChanges: 0,
      _requiredFields: 0
    }
  )
  const formStateWithRequiredFields = {
    ...formState,
    _requiredFields: Object.keys(formState).reduce(
      (reqs, field) => (formState[field].required ? reqs + 1 : reqs),
      0
    )
  }
  return formStateWithRequiredFields
}

/**
 *
 * @param {object} formInfo contains how to process the form
 * @param {object} prevFormState contains the state of the form
 * @param {string} eventType ['onChange', 'onBlur', 'onSubmit'] how we handle validation
 * @param {string} field - optional - the field that was clicked
 * @param {string} value - optional - the new value
 */
export const updateFormState = (formInfo, prevFormState, eventType, field, value) => {
  // console.log(`${field} (${eventType}): '${value}'`)
  // first we check if this a field or form:
  if (eventType === 'onSubmit' || !isValue(field)) {
    // we validate all the fields:
    return validateFormState(formInfo, prevFormState)
  }

  // if it's just getting focus, we return it as-is with the new event
  if (eventType === 'onFocus') {
    return { ...prevFormState, _formEvent: eventType }
  }

  // now we make sure the value is not undefined or null and fix it if necessary:
  value = value === undefined || value === null ? prevFormState[field].value : value

  // next we possibly cleanse the input using the retain function in formInfo:
  value =
    isValue(value) && formInfo[field].retain && eventType === 'onChange'
      ? retainValue(value, formInfo[field].retain)
      : value

  // next we check if the value is allowed:
  value =
    isValue(value) && formInfo[field].allow && eventType === 'onChange'
      ? testAllowed(value, prevFormState[field].value, formInfo[field].allow)
      : value

  // next we trim the entry (if not 'onChange'):
  value =
    isValue(value) && eventType !== 'onChange' && typeof value === 'string' ? value.trim() : value

  // if the value hasn't changed and we're showing success or errors, return the same prevFormState
  if (
    prevFormState[field].value === value &&
    prevFormState[field].errors.length > 0 &&
    prevFormState[field].showValidation !== ''
  ) {
    return {
      ...prevFormState,
      _formEvent: eventType,
      [field]: {
        ...prevFormState[field],
        errors: [...prevFormState[field].errors] // we MUST create a new errors array because Preact
      }
    }
  }

  // next we create a new formState with the new value (we clear the errors but keep the success):
  const newFormStateBeforeErrors = {
    ...prevFormState,
    [field]: {
      ...prevFormState[field],
      value,
      fieldChanged: prevFormState[field].defaultValue !== value,
      errors: [],
      showValidation:
        prevFormState[field].showValidation === 'success' && isValue(value) ? 'success' : ''
    },
    _formEvent: eventType
  }

  // and get the number of errors and if the form has changed
  const newFormState = {
    ...newFormStateBeforeErrors,
    _fieldsWithErrors: countFieldsWithErrors(newFormStateBeforeErrors),
    _fieldsWithChanges: countFieldsWithChanges(newFormStateBeforeErrors)
  }

  // then we check if we even need to validate:
  if (
    !isValue(formInfo[field]) ||
    !isValue(formInfo[field].validate) ||
    !isValue(formInfo[field].validate.tests)
  ) {
    return newFormState
  }

  // get the variables first:
  const {
    validate: { showErrors, showSuccess, preTests, tests },
    title,
    shortTitle
  } = formInfo[field]

  // we ONLY run potentially heavy validation logic on an 'onChange' event if showErrors or showSuccess is 'onChange'
  if (eventType === 'onChange' && showErrors !== 'onChange' && showSuccess !== 'onChange') {
    return newFormState
  }

  // if there's no value on a single validation, we clear the errors and return it:
  if (!isValue(value)) {
    return newFormState
  }

  // preTests to make sure we should even run the validation:
  if (preTests && preTests.length > 0 && !preTests.every(testFn => testFn(newFormState))) {
    return newFormState
  }

  // now we know we HAVE TO VALIDATE;
  // it's either 'onBlur' or showErrors: 'onChange' or showSuccess: 'onChange'
  const errors = validateField(value, tests, prevFormState, shortTitle || title)

  // now we have the errors; we can return a new formState however we like...
  const showValidation =
    errors.length > 0 && (eventType === showErrors || showErrors === 'onChange')
      ? 'errors'
      : errors.length === 0 && (eventType === showSuccess || showSuccess === 'onChange')
        ? 'success'
        : ''

  // then we create the newerFormState
  const newerFormState = {
    ...prevFormState,
    [field]: {
      ...prevFormState[field],
      value,
      fieldChanged: prevFormState[field].defaultValue !== value,
      errors,
      showValidation
    },
    _formEvent: eventType
  }

  // finally let's update the meta to the new formState:
  return {
    ...newerFormState,
    _fieldsWithErrors: countFieldsWithErrors(newerFormState),
    _fieldsWithChanges: countFieldsWithChanges(newFormStateBeforeErrors)
  }
}

/**
 *
 * validateFormState validates all of the formState against validations in formInfo
 *
 * @param {object} formInfo
 * @param {object} formState
 * @returns {boolean or object of errors}
 */
const validateFormState = (formInfo, prevFormState) => {
  let hasErrors = false
  const newFormState = Object.keys(prevFormState).reduce((newFormState, field) => {
    if (field.startsWith('_') || !formInfo[field].validate) {
      return {
        ...newFormState,
        [field]: prevFormState[field]
      }
    }
    const { value } = prevFormState[field]
    const {
      validate: { preTests, tests, showSuccess },
      title,
      shortTitle
    } = formInfo[field]
    // preTests to make sure we should even run the real tests:
    const shouldTest =
      !preTests || (preTests.length > 0 && preTests.every(testFn => testFn(prevFormState)))
    const errors = shouldTest ? validateField(value, tests, prevFormState, shortTitle || title) : []
    // have the first one with the error get the autoFocus:
    const autoFocus = !hasErrors && errors.length > 0
    hasErrors = hasErrors || errors.length > 0
    return {
      ...newFormState,
      [field]: {
        ...prevFormState[field],
        errors,
        autoFocus,
        showValidation: !shouldTest
          ? ''
          : errors.length > 0
            ? 'errors'
            : errors.length === 0 && isValue(showSuccess)
              ? 'success'
              : ''
      }
    }
  }, {})

  // now let's add the meta to the new formState:
  return {
    ...newFormState,
    _formEvent: 'onSubmit',
    _fieldsWithErrors: countFieldsWithErrors(newFormState),
    _fieldsWithChanges: countFieldsWithChanges(newFormState)
  }
}

export const validateField = (value, tests, formState, title = 'Field') => {
  // look for validate.required first. If required, just return that.
  const requiredFn = tests.find(testFn => testFn.name === 'required')
  if (requiredFn) {
    const requiredError = requiredFn(value, title)
    // if empty, just return that error in an array:
    if (requiredError) return [requiredError]
  }
  // otherwise, return the field's other validations:
  return (
    tests
      .map(testFn =>
        // remove the required test:
        testFn.name === 'required' ? false : testFn(value, title, formState)
      )
      // remove the blank errors:
      .filter(e => e)
  )
}

export const clearFormStateErrors = prevFormState =>
  Object.keys(prevFormState).reduce(
    (newFormState, key) =>
      key.startsWith('_')
        ? {
          ...newFormState,
          [key]: prevFormState[key]
        }
        : {
          ...newFormState,
          [key]: {
            ...prevFormState[key],
            errors: [],
            showValidation: ''
          }
        },
    { _fieldsWithErrors: 0 }
  )

const countFieldsWithErrors = formState =>
  Object.keys(formState).reduce(
    (errs, key) => (formState[key].errors && formState[key].errors.length > 0 ? errs + 1 : errs),
    0
  )

const countFieldsWithChanges = formState =>
  Object.keys(formState).reduce(
    (changes, key) => (formState[key].fieldChanged ? changes + 1 : changes),
    0
  )

/**
 * testAllowed tests the allowed functions are returns oldValue if not allowed
 *
 * @param {string} newValue the new value to test
 * @param {string} oldValue the previous value
 * @param {array} allowFns functions to test against
 */
export const testAllowed = (newValue, oldValue, allowFns) => {
  return allowFns.some(allowFn => allowFn(newValue)) ? oldValue : newValue
}

/**
 * retainValue goes through functions to only retain (cleanse) the necessary characters
 *
 * @param {string} initialValue the value coming in
 * @param {array} retainFns functions to which will cleanse the initialValue
 * @returns {string} the cleansed value
 */
export const retainValue = (initialValue, retainFns) => {
  return retainFns.reduce((result, retainFn) => retainFn(result), initialValue)
}

const stripFormStateMeta = formState =>
  Object.keys(formState).reduce(
    (newFormState, field) =>
      field.startsWith('_')
        ? newFormState
        : { ...newFormState, [field]: { field, value: formState[field].value } },
    {}
  )

export const getFormStateValues = formState =>
  Object.entries(stripFormStateMeta(formState)).reduce(
    (data, [name, item]) => ((data[name] = item.value), data),
    {}
  )

export const debugFormState = formState => {
  console.table(
    Object.keys(formState).reduce(
      (result, field) => ({
        ...result,
        [field]:
          typeof formState[field] === 'object'
            ? Object.keys(formState[field]).reduce(
              (lineResult, fieldAttr) =>
                Array.isArray(formState[field][fieldAttr])
                  ? {
                    ...lineResult,
                    [fieldAttr]: formState[field][fieldAttr]
                      .map(item =>
                        Object.keys(item).reduce(
                          (str, key) => (str === '' ? item[key] : str + ' ' + item[key]),
                          ''
                        )
                      )
                      .join('\n')
                  }
                  : {
                    ...lineResult,
                    [fieldAttr]: formState[field][fieldAttr]
                  },
              {}
            )
            : formState[field]
      }),
      {}
    )
  )
}
