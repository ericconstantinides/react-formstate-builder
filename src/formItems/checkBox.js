// @flow

import React, { type Node } from 'react'
import { View, Text, Spacer } from '.'
import { type Style } from '.'
import RadioGroupStyles from 'react-zeolite-styles/RadioGroup'
import CheckBoxStyles from 'react-zeolite-styles/CheckBox'

import { cssJoinFactory } from 'utilities/styleUtils'
const cj = cssJoinFactory(RadioGroupStyles, CheckBoxStyles)

type Props = {
  style?: Style,
  title?: Node,
  titleStyle?: Style,
  checked?: boolean,
  field: string,
  value?: any,
  titleFontSize?: string,
  children?: Node,
  showValidation?: boolean,
  noBorder?: boolean,
  onChange?: any => void,
  variant?: string,
  onFormItemEvent?: (string, string, any) => void
}

/**
 * A checkbox component that supports style-guide styles and interactivity.
 */
class CheckBox extends React.PureComponent<Props> {
  state = { checked: false }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextPropsCheckedValue =
      nextProps.checked !== undefined
        ? nextProps.checked
        : nextProps.value !== undefined ? nextProps.value : undefined
    return prevState.checked !== nextPropsCheckedValue ? { checked: nextPropsCheckedValue } : null
  }

  handleEvent = (eventType: string) => event => {
    const { onChange, onFormItemEvent, field } = this.props
    const { checked } = this.state
    if (onFormItemEvent) {
      // uses the <Form> component:
      onFormItemEvent(eventType, field, eventType === 'onChange' ? !checked : checked)
    } else if (eventType === 'onChange') {
      // Not using the <Form> component:
      this.setState(state => ({ checked: !state.checked }))
      if (onChange) {
        onChange(event)
      }
    }
  }

  render() {
    const {
      children,
      style,
      title,
      titleStyle,
      titleFontSize = 'xsmall',
      noBorder,
      isDisabled,
      variant = 'line' // variants are 'line' or 'solid'
    } = this.props
    const { checked } = this.state
    return (
      <View
        className={cj(
          'label__container' +
            (noBorder ? ' noBorder' : '') +
            (isDisabled ? ' is-disabled' : ' not-disabled')
        )}
      >
        <View className={cj('label')} tagName="label" style={style}>
          <View
            tagName="input"
            type="checkbox"
            checked={checked}
            className={cj('checkbox checkbox--' + variant)}
            onChange={this.handleEvent('onChange')}
            onBlur={this.handleEvent('onBlur')}
            onFocus={this.handleEvent('onFocus')}
            disabled={isDisabled}
          />
          <Spacer />
          <Text
            fontSize={titleFontSize}
            style={titleStyle}
            className={cj(
              'checkbox-title checkbox-title--' + (isDisabled ? 'is-disabled' : 'not-disabled')
            )}
          >
            {title}
          </Text>
        </View>
        {React.Children.count(children) > 0 && (
          <View horizontal>
            <Spacer size="large" style={{ minHeight: 0 }} />
            <View flex="1 1 auto">{children}</View>
          </View>
        )}
      </View>
    )
  }
}

export default CheckBox
