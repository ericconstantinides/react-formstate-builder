import React from 'react'

import { TextInput as NativeTextInput } from 'react-native'
import { View } from '.'

import styles from 'react-zeolite-styles/TextInput'
import globalTypeStyles from 'global-styles/Type'

class TextInput extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      focused: props.focused,
      disabled: props.disabled
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.overrideFocus !== undefined && this.props.overrideFocus !== null) {
      this.setState({ focused: this.props.overrideFocus })
    }
    if (
      prevProps.triggerFocusOn !== this.props.triggerFocusOn &&
      this.props.triggerFocusOn !== null &&
      this.props.triggerFocusOn !== undefined
    ) {
      this.setState({ focused: true })
    }
    if (
      prevProps.triggerFocusOff !== this.props.triggerFocusOff &&
      this.props.triggerFocusOff !== null &&
      this.props.triggerFocusOff !== undefined
    ) {
      this.setState({ focused: false })
    }
  }

  handleFocus = event => {
    if (this.props.onFocus) {
      this.props.onFocus(event)
    }
    this.setState({ focused: true })
  }

  handleBlur = event => {
    if (this.props.onBlur) {
      this.props.onBlur(event)
    }
    this.setState({ focused: false })
  }

  handleChange = event => {
    if (this.props.onChange) {
      this.props.onChange(event)
    }
  }

  render() {
    // remove props that would cause errors before creating 'otherProps':
    const {
      value,
      invalid,
      showValidation,
      multiline,
      onFocus,
      onBlur,
      onChange,
      style,
      overrideFocus,
      triggerFocusOn,
      triggerFocusOff,
      ...otherProps
    } = this.props

    const containerStyle = [
      styles.container,
      style && style,
      multiline && styles.multiline,
      globalTypeStyles.defaultFont,
      this.state.focused && styles.focused,
      invalid && styles.invalid,
      showValidation && showValidation === 'errors' && styles.invalid,
      showValidation && showValidation === 'success' && styles.success
    ]

    return (
      <View
        component={NativeTextInput}
        value={value}
        style={containerStyle}
        multiline={multiline}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
        {...otherProps}
      />
    )
  }
}

export default TextInput
