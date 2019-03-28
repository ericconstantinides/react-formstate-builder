import React from 'react'
import { View, Text } from '.'
import RadioGroupStyles from 'react-zeolite-styles/RadioGroup'
import { cssJoinFactory } from 'utilities/styleUtils'
const cj = cssJoinFactory(RadioGroupStyles)

/*
 * RadioButton
 *
 * buttonId === id and htmlFor
 *   HTML props that must match and be unique so label + radio accept same click
 *
 * groupId === name
 *   unique to the group so that it only accepts one radio item at a time
 *
 */
const RadioButton = props => {
  const { value, label, buttonId, groupId, groupValue, hasBorder, onRadioEvent, style } = props
  return (
    <View className={cj('label__container' + (hasBorder ? ' hasBorder' : ''))} style={style}>
      <View tagName="label" className={cj('label')}>
        <View
          tagName="input"
          type="radio"
          className={cj('radio')}
          id={buttonId}
          name={groupId}
          rounded
          width={20}
          height={20}
          checked={groupValue === value}
          onChange={onRadioEvent('onChange', value)}
          onBlur={onRadioEvent('onBlur', value)}
        />
        <Text className={cj('title')} htmlFor={buttonId}>
          {label}
        </Text>
      </View>
    </View>
  )
}

export default RadioButton
