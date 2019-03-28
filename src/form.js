import React from 'react'
import FormItem from './formItems/formItem'
import {
  initializeFormState,
  updateFormState,
  getFormStateValues,
  clearFormStateErrors,
  debugFormState
} from './formState'

/**
 * Form takes 4 values:
 * formInfo
 * formInitialValues (optional)
 * onFormSubmit
 * onFormItemEvent (optional)
 */
class Form extends React.PureComponent {
  state = { formState: initializeFormState(this.props.formInfo, this.props.formInitialValues) }
  autoFocus = false
  autoFocusSet = false
  formItemType = <FormItem />.type

  componentDidMount = () => {
    this.handleFormItemEvent('onLoad', null, null)
  }

  handleFormItemEvent = (eventType, field, value) => {
    const { formInfo, onFormItemEvent } = this.props
    const previousValue = this.state.formState[field]
      ? this.state.formState[field].value
      : undefined
    this.setState(
      state => ({
        formState:
          eventType === 'onLoad'
            ? state.formState
            : updateFormState(formInfo, state.formState, eventType, field, value)
      }),
      () => {
        const { formState } = this.state
        const formItemEventValues = {
          formState,
          formValues: getFormStateValues(formState),
          formEvent: { eventType, field, value, previousValue },
          onFormSubmitError: this.handleFormSubmitError,
          clearFormErrors: this.clearFormErrors
        }
        if (features.formDebug.isEnabled) {
          debugFormState(formState)
        }
        if (onFormItemEvent) {
          onFormItemEvent(formItemEventValues)
        }
      }
    )
  }

  handleFormValidation = (event) => {
    event.preventDefault()
    if (this.props.formSubmitDisabled) return
    const { formInfo, onFormSubmit } = this.props
    const formState = updateFormState(formInfo, this.state.formState, 'onSubmit')
    if (formState._fieldsWithErrors > 0) {
      this.setState(state => ({ formState }))
      return
    }
    // form passes front-end validation. Now send to the API:
    onFormSubmit({
      formState,
      formValues: getFormStateValues(formState),
      onFormSubmitError: this.handleFormSubmitError,
      clearFormErrors: this.clearFormErrors
    })
  }

  handleFormSubmitError = (error, field, eventName = 'onSubmit') => {
    this.setState(state => ({
      formState: {
        ...state.formState,
        _formEvent: eventName,
        _fieldsWithErrors: 1,
        [field]: {
          ...state.formState[field],
          errors: [error],
          showValidation: 'errors'
        }
      }
    }))
  }

  clearFormErrors = formState => {
    this.setState({ formState: clearFormStateErrors(formState) })
  }

  prepFormItem = child => {
    const { formInfo } = this.props
    const { formState } = this.state
    const { field } = child.props
    this.autoFocus =
      !this.autoFocusSet &&
      (formState._formEvent === 'onLoad' || formState._formEvent === 'onSubmit') &&
      (formState._fieldsWithErrors === 0 || formState[field].errors.length > 0)
    this.autoFocusSet = this.autoFocusSet || this.autoFocus
    return React.cloneElement(child, {
      ...child.props,
      ...formState[field],
      ...formInfo[field],
      onFormItemEvent: this.handleFormItemEvent,
      autoFocus: this.autoFocus
    })
  }

  recursiveCloneChildren = children => {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child)) return child
      if (
        (React.Children.count && React.Children.count(child) > 0) ||
        (child.children && child.children.length > 0)
      ) {
        let childProps = {}
        const newChild = child.type === this.formItemType ? this.prepFormItem(child) : child
        childProps.children = this.recursiveCloneChildren(newChild.props.children)
        return React.cloneElement(newChild, childProps)
      }
      if (child.type !== this.formItemType) return child
      // add the formItem props to the formItem
      return this.prepFormItem(child)
    })
  }

  render() {
    const {
      children,
      formInfo,
      formInitialValues,
      formSubmitDisabled,
      onFormSubmit,
      onFormItemEvent,
      ...otherProps
    } = this.props

    this.autoFocus = false
    this.autoFocusSet = false
    return (
      <form noValidate onSubmit={this.handleFormValidation} {...otherProps}>
        <button type="submit" tabIndex="-1" hidden onPress={this.handleFormValidation} />
        {this.recursiveCloneChildren(children)}
      </form>
    )
  }
}

export default Form
