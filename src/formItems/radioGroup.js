import React from 'react'
import { FormItemTitle, View, Spacer, Errors, RadioButton } from '.'

/**
 * RadioGroup creates a Radio Group
 */
class RadioGroup extends React.PureComponent {
  handleEvent = (eventType, value) => event => {
    this.props.onFormItemEvent(eventType, this.props.field, value)
  }

  renderRadioItems = () => {
    const { children, items, field, value: groupValue } = this.props
    if (React.Children.count(children) > 0) {
      const radioButtonType = <RadioButton />.type

      return React.Children.map(children, child => {
        if (child.type !== radioButtonType) return child

        return React.cloneElement(child, {
          // value: child.props.value <- not necessary as it's cloned
          // TODO: Preact has children but not child.props.children
          //       Is this a bug, or are we digging under the actual API?
          label: child.children || child.props.children,
          buttonId: child.children || child.props.children,
          groupId: field,
          groupValue,
          onRadioEvent: this.handleEvent
        })
      })
    }
    return items.map((item, i) => {
      const [name, value] = Object.entries(item)[0]
      return (
        <RadioButton
          key={i}
          value={value}
          label={name}
          buttonId={name}
          groupId={field}
          groupValue={groupValue}
          onRadioEvent={this.handleEvent}
        />
      )
    })
  }

  render() {
    const { title, tooltip, errors, showValidation, omitErrors } = this.props

    return (
      <View>
        {title && <FormItemTitle title={title} tooltip={tooltip} />}
        {this.renderRadioItems()}
        {!omitErrors && [
          <Errors key="0" errors={errors} showValidation={showValidation} />,
          <Spacer key="1" size="xsmall" />
        ]}
      </View>
    )
  }
}

export default RadioGroup
