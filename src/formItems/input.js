// @flow

import React from 'react'
import { FormItemTitle, Text, TextInput, Spacer, Errors } from '.'
import { isValue, formatPhoneNumber, formatThousands } from 'utilities/stringUtils'

/**
 * A text input field with support for validation, tooltips, and a text prefix.
 */
class FormInput extends React.PureComponent {
  state = { selected: false }

  createDisplayValue = (value, display) => {
    if (!isValue(display)) {
      return value
    }

    if (display === 'phone') {
      return formatPhoneNumber(value)
    } else if (display === 'thousands') {
      return formatThousands(value)
    }

    return value
  }

  handleEvent = (eventType) => (event) => {
    const { multiline, value, onFormItemEvent, field } = this.props
    this.setState({
      selected: eventType === 'onFocus' || eventType === 'onChange'
    })

    // when focusing on the input, put the real value in there and then select it:
    if (!multiline && eventType === 'onFocus') {
      if (event.target instanceof HTMLInputElement) {
        event.target.value = value
        // add a setTimeout to fix for Preact:
        if (event.nativeEvent) {
          event.target.select()
        } else {
          setTimeout(() => {
            event.target.select()
          }, 1)
        }
      }
    }

    // For Flow:
    // const elementInstance = multiline ? HTMLTextAreaElement : HTMLInputElement

    // runs the component's "handleFormItemEvent (eventType, field, value)"
    if (onFormItemEvent) {
      onFormItemEvent(eventType, field, event.target.value)
    }
  }

  render() {
    const prefixStyle = {
      position: 'absolute',
      zIndex: '1',
      top: '0',
      bottom: '0',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 10px'
    }
    const {
      field,
      type,
      title,
      prefix,
      prefixPadding = 0,
      tooltip,
      value,
      display,
      autoFocus,
      autoCorrect,
      autocomplete,
      placeholder,
      errors,
      showValidation,
      inputStyle,
      multiline,
      pattern,
      omitErrors
    } = this.props

    const { selected } = this.state
    const displayValue = selected ? value : this.createDisplayValue(value, display)

    return (
      <div>
        {title && <FormItemTitle title={title} tooltip={tooltip} />}
        {prefix && (
          <div style={prefixStyle}>
            <Text textColor="gray400">{prefix}</Text>
          </div>
        )}
        <TextInput
          field={field}
          id={field}
          type={type}
          value={displayValue}
          autoFocus={autoFocus || false}
          autoCapitalize="none"
          autoCorrect={autoCorrect || false}
          autoComplete={autocomplete}
          multiline={multiline}
          pattern={pattern}
          placeholder={placeholder}
          onChange={this.handleEvent('onChange')}
          onBlur={this.handleEvent('onBlur')}
          onFocus={this.handleEvent('onFocus')}
          showValidation={showValidation}
          selected={selected}
          style={[inputStyle, prefixPadding && { paddingLeft: prefixPadding }]}
        />
        {!omitErrors && [
          <Errors key="2" errors={errors} showValidation={showValidation} />,
          <Spacer key="3" size="xsmall" />
        ]}
      </div>
    )
  }
}

export default FormInput
