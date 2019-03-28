// @flow

import React from 'react'
import { View, TextInput, Image, FormItemTitle } from 'react-zeolite'
import GlobalPopupContainer, {
  GlobalPopupToggle,
  GlobalPopupContent
} from 'react-zeolite/GlobalPopup'
import TinyDatePicker from 'tiny-date-picker'
import { dateShort, fixDateForIE11 } from 'utilities/dateUtils'
import DatePickerStyles from 'react-zeolite-styles/DatePicker'
import { withinElement } from 'utilities/htmlUtils'

import { cssJoinFactory } from 'utilities/styleUtils'
const cj = cssJoinFactory(DatePickerStyles)

class DatePicker extends React.Component {
  datePicker = null
  dateInputElement = null
  datePickerContainerElement = null
  isDatePickerInitialized = false
  isTextInputAltered = false
  state = {
    dateInputElement: null, // we need this as a state so that relativeTo works correctly
    selectedDate: null,
    isPopupOpen: false,
    isEntireDatePickerActive: false,
    triggerPopupShow: null,
    triggerPopupHide: null,
    triggerFocusOn: null,
    triggerFocusOff: null
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick, true)
    document.addEventListener('keydown', this.handleKeyDown, false)
  }

  componentDidUpdate(prevProps, prevState) {
    this.initDatePicker()
  }

  componentWillUnmount() {
    this.datePicker.destroy()
    window.removeEventListener('click', this.handleWindowClick, true)
    document.removeEventListener('keydown', this.handleKeyDown, false)
  }

  initDatePicker = () => {
    if (!this.isDatePickerInitialized && this.dateInputElement && this.datePickerContainerElement) {
      this.isDatePickerInitialized = true
      // init the datepicker:
      this.datePicker = TinyDatePicker(this.datePickerContainerElement, {
        mode: 'dp-permanent',
        lang: { days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] },
        hilightedDate: this.props.defaultValue || new Date(),
        min: this.props.minValue,
        max: this.props.maxValue
      })
      // create the datepicker select action
      this.datePicker.on('select', this.handleDatePickerSelect)
    }
  }

  saveDateInputElement = element => {
    if (!element) return null
    this.dateInputElement = element
    this.setState({ dateInputElement: element })
    this.initDatePicker()
  }

  saveDatePickerContainerElement = element => {
    if (!element) return null
    this.datePickerContainerElement = element
    this.initDatePicker()
  }

  saveToggleElement = element => {
    if (!element) return null
    this.toggleElement = element
  }

  handleWindowClick = event => {
    const isWithinPopupOrDatepicker = this.checkIfWithinPopup(event)
    this.setState(state => {
      if (state.isEntireDatePickerActive && !isWithinPopupOrDatepicker) {
        this.props.onFormItemEvent(
          'onBlur -- window click',
          this.props.field,
          fixDateForIE11(this.datePicker.state.selectedDate)
        )
        return {
          triggerFocusOff: Math.random(),
          isPopupOpen: false,
          isEntireDatePickerActive: false
        }
      } else if (!state.isEntireDatePickerActive && isWithinPopupOrDatepicker) {
        window.setTimeout(() => {
          this.props.onFormItemEvent(
            'onFocus',
            this.props.field,
            fixDateForIE11(this.datePicker.state.selectedDate)
          )
        }, 50)
        return {
          triggerFocusOn: Math.random(),
          isPopupOpen: true,
          isEntireDatePickerActive: true
        }
      }
    })
  }

  handleKeyDown = event => {
    // look for the <TAB> key:
    if (event.keyCode === 9 && this.state.isEntireDatePickerActive) {
      this.setState(state => ({
        triggerFocusOff: Math.random(),
        triggerPopupHide: Math.random(),
        isPopupOpen: false,
        isEntireDatePickerActive: false
      }))
      this.props.onFormItemEvent(
        'onBlur',
        this.props.field,
        fixDateForIE11(this.datePicker.state.selectedDate)
      )
    }
  }

  checkIfWithinPopup = event => {
    const isWithinToggle = withinElement(this.toggleElement, event.target)
    const isWithinTextInput = withinElement(this.dateInputElement, event.target)
    const isWithinPopup = withinElement(this.datePickerContainerElement, event.target)
    if (isWithinToggle || isWithinTextInput || isWithinPopup) {
      return true
    }
    return false
  }

  handleDatePickerSelect = (_, datePicker) => {
    this.props.onFormItemEvent(
      'onChange',
      this.props.field,
      fixDateForIE11(datePicker.state.selectedDate)
    )
    this.setState(state => {
      const isTextInputAltered = this.isTextInputAltered
      this.isTextInputAltered = false
      return {
        selectedDate: datePicker.state.selectedDate,
        triggerPopupHide: isTextInputAltered ? state.triggerPopupHide : Math.random(),
        triggerFocusOn: Math.random()
      }
    })
  }

  handleEvent = (eventType: string) => (event: Event) => {
    const dateValue = fixDateForIE11(event.target.value)
    if (eventType === 'onFocus' && !this.state.isEntireDatePickerActive) {
      this.setState({
        triggerPopupShow: Math.random(),
        isPopupOpen: true,
        isEntireDatePickerActive: true
      })
      window.setTimeout(() => {
        this.props.onFormItemEvent('onFocus', this.props.field, dateValue)
      }, 20)
    } else if (eventType === 'onBlur' && this.state.isEntireDatePickerActive) {
      if (this.checkIfWithinPopup(event)) {
        this.setState({ triggerFocusOn: Math.random() })
      } else {
        this.setState({
          triggerFocusOff: Math.random(),
          triggerPopupHide: Math.random(),
          isPopupOpen: false,
          isEntireDatePickerActive: false
        })
        this.props.onFormItemEvent('onBlur', this.props.field, dateValue)
      }
    } else if (eventType === 'onChange') {
      this.isTextInputAltered = true
      this.datePicker.setState({ selectedDate: dateValue })
    }
  }

  render() {
    const {
      title,
      tooltip,
      pattern = '[0-9]{2}/[0-9]{2}/[0-9]{4}',
      field,
      autoFocus,
      // value,
      defaultValue,
      showValidation,
      placeholder = 'mm/dd/yyyy'
    } = this.props

    const toggleProps = {
      horizontal: true,
      alignItems: 'center',
      style: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: 40,
        width: 40,
        cursor: 'pointer'
      }
    }
    const { onFormItemEvent, minValue, maxValue, ...otherProps } = this.props
    return (
      <View {...otherProps}>
        {title && <FormItemTitle title={title} tooltip={tooltip} />}

        <TextInput
          field={field}
          id={field}
          value={dateShort(this.state.selectedDate || defaultValue || new Date())}
          autoFocus={autoFocus || false}
          pattern={pattern}
          placeholder={placeholder}
          showValidation={showValidation}
          onFocus={this.handleEvent('onFocus')}
          onBlur={this.handleEvent('onBlur')}
          onChange={this.handleEvent('onChange')}
          triggerFocusOn={this.state.triggerFocusOn}
          triggerFocusOff={this.state.triggerFocusOff}
          tagRef={this.saveDateInputElement}
        />
        {this.state.dateInputElement && (
          <GlobalPopupContainer
            // triggerEvents={['onClick']} // not yet implemented
            relativeTo={this.dateInputElement}
            triggerPopupHide={this.state.triggerPopupHide}
            triggerPopupShow={this.state.triggerPopupShow}
            top="52px"
            right="-22px"
          >
            <GlobalPopupToggle {...toggleProps}>
              <View
                tagRef={this.saveToggleElement}
                style={{
                  paddingRight: 8,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Image source="/images/icon_calendar.svg" width={28} height={28} />
              </View>
            </GlobalPopupToggle>
            <GlobalPopupContent>
              <View tagRef={this.saveDatePickerContainerElement} className={cj('dp_container')} />
            </GlobalPopupContent>
          </GlobalPopupContainer>
        )}
        <View />
      </View>
    )
  }
}

export default DatePicker
