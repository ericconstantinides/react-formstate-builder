// @flow

import React from 'react'
import { FormItemTitle, View, Text, Spacer, Errors } from '.'
import styles from 'react-zeolite-styles/FormSelect'

class FormSelect extends React.PureComponent {
  handleEvent = (eventType: string) => (event: Event) => {
    if (event.target instanceof HTMLSelectElement) {
      this.props.onFormItemEvent(eventType, this.props.field, event.target.value)
    }
  }

  renderSelectItems = () => {
    return this.props.items.map((item, i) => {
      const [name, value] = Object.entries(item)[0]
      return (
        <Text key={i} tagName="option" value={value}>
          {name}
        </Text>
      )
    })
  }

  render() {
    const {
      title,
      tooltip,
      field,
      value,
      errors,
      showValidation,
      inputStyle,
      placeholder = 'Select',
      autocomplete,
      omitErrors
    } = this.props
    const style = [styles.select, inputStyle && inputStyle]

    return (
      <View>
        {title && <FormItemTitle title={title} tooltip={tooltip} />}
        <Text
          tagName="select"
          field={field}
          defaultValue={this.props.value}
          onChange={this.handleEvent('onChange')}
          onBlur={this.handleEvent('onBlur')}
          onFocus={this.handleEvent('onFocus')}
          autoComplete={autocomplete}
          style={style}
          textColor={value ? 'primaryDark' : 'gray400'}
          invalid={errors.length > 0}
          showValidation={showValidation}
        >
          <Text tagName="option" value="">
            {placeholder}
          </Text>
          {this.renderSelectItems()}
        </Text>
        {!omitErrors && [
          <Errors key="2" errors={errors} showValidation={showValidation} />,
          <Spacer key="3" size="xsmall" />
        ]}
      </View>
    )
  }
}

export default FormSelect
