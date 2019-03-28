// @flow

import React from 'react'
import errorsStyles from '../../styles/Errors.css'
import { cssJoinFactory } from 'utilities/styleUtils'
import AnimateHeight from 'react-animate-height'
const cj = cssJoinFactory(errorsStyles)

const Error = ({ error }) => {
  const errorArr = typeof error === 'string' ? [error] : error
  return (
    <span fontSize="xsmall">
      {errorArr.map((err, i) => (!(i % 2) ? <span fontWeight="semibold">{err} </span> : err + ' '))}
    </span>
  )
}

/**
 * A list of one or more errors shown with an exclamation mark and red text.
 */
const Errors = (props) => {
  const { errors, showValidation } = props
  let firstRenderedError = <li>&nbsp;</li>
  let additionalRenderedErrors = []
  const showErrors =
    (errors && errors.length > 0 && showValidation === undefined) ||
    (errors && errors.length > 0 && showValidation && showValidation === 'errors')

  if (showErrors) {
    const [firstError, ...additionalErrors] = errors
    firstRenderedError = (
      <li className={cj('error')}>
        <Error error={firstError} />
      </li>
    )
    additionalRenderedErrors =
      additionalErrors.length > 0
        ? additionalErrors.map((e, i) => (
          <li key={i} className={cj('error')} >
            <Error error={e} />
          </li>
        ))
        : null
  }

  return (
    <div className={cj(`container ${showErrors ? 'has-errors' : 'no-errors'}`)}>
      <div tagName="ul">{firstRenderedError}</div>
      <AnimateHeight
        height={
          (errors && errors.length > 1 && showValidation === undefined) ||
          (errors && errors.length > 1 && showValidation && showValidation === 'errors')
            ? 'auto'
            : 0
        }
        duration={100}
        easing="linear"
      >
        <div tagName="ul">{additionalRenderedErrors}</div>
      </AnimateHeight>
    </div>
  )
}

export default Errors
