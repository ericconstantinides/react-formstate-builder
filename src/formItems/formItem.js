// @flow

/*
 * FormInput
 *
 * Available TextInput Props:
 * field
 * value
 * autoFocus
 * autoCapitalize
 * autoCorrect
 * placeholder
 *
 * Available Method Props:
 * onBlur
 * onChange
 *
 * Available validation prop types:
 * notRequired (boolean)
 * validateEmail (boolean)
 * validateMinLength={NUMBER}
 * validateMaxLength={NUMBER}
 * validateCustom={FUNCTION which takes a value; if validation fails returns an error string or JSX}
 *
 * Available Validation action props:
 * validateOnBlur [true, false, 'ignore-empty']
 * validateOnChange (boolean: default false)
 * updateFormState: when this turns into a function, it will take the field and if valid boolean
 *
 */

import React from 'react'
import Loadable from 'react-loadable'
import { elPos, findScrollContainer } from 'utilities/htmlUtils'
import AnimateScroll from 'utilities/AnimateScroll'

import Errors from '../Errors'
import FormItemTitle from './FormItemTitle'
// we load the formInput since it's almost always used:
import FormInput from './FormInput'

const FORM_TOP_PADDING = 15
const SITE_HEADER_DEFAULT_HEIGHT = 52

const FormSelect = Loadable({
  loader: () => import(/* webpackChunkName: "FormSelect" */ './FormSelect'),
  loading: () => <div />
})
const RadioGroup = Loadable({
  loader: () => import(/* webpackChunkName: "RadioGroup" */ './RadioGroup'),
  loading: () => <div />
})
const ButtonGroup = Loadable({
  loader: () => import(/* webpackChunkName: "ButtonGroup" */ './ButtonGroup'),
  loading: () => <div />
})
const DatePicker = Loadable({
  loader: () => import(/* webpackChunkName: "DatePicker" */ './DatePicker'),
  loading: () => <div />
})
const CheckBox = Loadable({
  loader: () => import(/* webpackChunkName: "CheckBox" */ './CheckBox'),
  loading: () => <div />
})

const renderFormItem = props => {
  const { variant, title, tooltip, ...otherProps } = props
  if (variant === 'FormInput') {
    return <FormInput omitErrors {...otherProps} />
  }
  if (variant === 'FormSelect') {
    return <FormSelect omitErrors {...otherProps} />
  }
  if (variant === 'RadioGroup') {
    return <RadioGroup omitErrors {...otherProps} />
  }
  if (variant === 'ButtonGroup') {
    return <ButtonGroup omitErrors {...otherProps} />
  }
  if (variant === 'DatePicker') {
    const { fieldChanged, showValidation, ...datePickerProps } = otherProps
    return <DatePicker {...datePickerProps} /> // no omitErrors because DatePicker has no error
  }
  if (variant === 'CheckBox') {
    return <CheckBox title={title} tooltip={tooltip} {...otherProps} />
  }
}

class FormItem extends React.PureComponent {
  siteHeader = null
  siteHeaderHeight = SITE_HEADER_DEFAULT_HEIGHT
  saveElRef = element => {
    this.element = element
    this.scrollToError(element)
  }

  /**
   * scrollToError moves either the page or the container (modal) to the error
   */
  scrollToError = element => {
    const { autoFocus, selected, errors } = this.props
    const thisElement = element || this.element || null
    if (autoFocus && !selected && thisElement && errors && errors.length > 0) {
      // this assumes (incorrectly) that  and not an inner element
      const scrollContainer = findScrollContainer(thisElement)
      if (scrollContainer === document.documentElement || scrollContainer === document.body) {
        // Page scroll:
        const pxFromPageTop = elPos(thisElement).top
        this.siteHeader = this.siteHeader || document.getElementById('site-header') || null
        this.siteHeaderHeight = this.siteHeader
          ? this.siteHeader.clientHeight
          : SITE_HEADER_DEFAULT_HEIGHT
        const pxFromViewportTop = thisElement.getBoundingClientRect().top
        if (pxFromViewportTop - this.siteHeaderHeight - FORM_TOP_PADDING < 0) {
          AnimateScroll(pxFromPageTop - this.siteHeaderHeight - FORM_TOP_PADDING, 250)
        }
      } else {
        // Modal or other container scroll:
        const pxFromContainerTop = elPos(thisElement, scrollContainer.firstChild).top
        AnimateScroll(pxFromContainerTop - FORM_TOP_PADDING, 250, scrollContainer)
      }
    }
  }

  render() {
    const { title, variant, tooltip, errors, showValidation, style, omitErrors } = this.props

    this.scrollToError()
    if (variant === 'CheckBox') {
      return renderFormItem(this.props)
    }

    return (
      <div style={style} tagRef={this.saveElRef}>
        {title && <FormItemTitle title={title} tooltip={tooltip} />}
        {renderFormItem(this.props)}
        {(!omitErrors || (errors && errors.length > 0)) && [
          <Errors key="errors" errors={errors} showValidation={showValidation} />,
        ]}
      </div>
    )
  }
}

export default FormItem
