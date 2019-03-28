import React from 'react'
import { validate } from 'react-formstate'

const formInfo = {
  certificateRequestType: {
    variant: 'RadioGroup',
    validate: {
      tests: [validate.required]
    }
  },
  liabilityCompanyName: {
    variant: 'FormInput',
    title: 'Certificate Holder Name',
    autocomplete: 'name',
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'liability'],
      tests: [validate.required]
    }
  },
  liabilityStreetAddress: {
    variant: 'FormInput',
    title: 'Certificate Holder Street Address',
    shortTitle: 'Street Address',
    autocomplete: 'street-address',
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'liability'],
      tests: [validate.required]
    }
  },
  liabilityZipCode: {
    variant: 'FormInput',
    title: 'Zip Code',
    autocomplete: 'postal-code',
    pattern: '\\d*',
    retain: [retain.digits],
    allow: [allow.maxLength(5)],
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'liability'],
      showSuccess: 'onChange',
      showErrors: 'onBlur',
      tests: [validate.required, validate.isNumberLength(5)]
    }
  },
  liabilityCity: {
    variant: 'FormInput',
    title: 'City',
    autocomplete: 'address-level2',
    retain: [retain.alphaDashesSpaces],
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'liability'],
      tests: [validate.required, validate.minLength(3)]
    }
  },
  liabilityState: {
    variant: 'FormSelect',
    title: 'State',
    autocomplete: 'address-level1',
    items: usStates,
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'liability'],
      tests: [validate.required]
    }
  },
  liabilityAttn: {
    variant: 'FormInput',
    title: 'Attn',
    shortTitle: 'Attn'
  },
  propertyCompanyName: {
    variant: 'FormInput',
    title: 'Additional Interest Company Name',
    autocomplete: 'name',
    shortTitle: 'Company Name',
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      tests: [validate.required]
    }
  },
  propertyStreetAddress: {
    variant: 'FormInput',
    title: 'Additional Interest Street Address',
    autocomplete: 'street-address',
    shortTitle: 'Street Address',
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      tests: [validate.required]
    }
  },
  propertyZipCode: {
    variant: 'FormInput',
    title: 'Zip Code',
    autocomplete: 'postal-code',
    pattern: '\\d*',
    retain: [retain.digits],
    allow: [allow.maxLength(5)],
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      showSuccess: 'onChange',
      showErrors: 'onBlur',
      tests: [validate.required, validate.isNumberLength(5)]
    }
  },
  propertyCity: {
    variant: 'FormInput',
    title: 'City',
    autocomplete: 'address-level2',
    retain: [retain.alphaDashesSpaces],
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      tests: [validate.required, validate.minLength(3)]
    }
  },
  propertyState: {
    variant: 'FormSelect',
    title: 'State',
    autocomplete: 'address-level1',
    items: usStates,
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      tests: [validate.required]
    }
  },
  propertyCoverageAmount: {
    variant: 'FormInput',
    title: 'How much property coverage is required (this can be the amount of your loan)?',
    shortTitle: 'Property Coverage',
    prefix: '$',
    prefixPadding: '1.375em',
    pattern: '\\d*',
    display: 'thousands',
    retain: [retain.positiveFloatNumbers],
    validate: {
      preTests: [formState => formState.certificateRequestType.value === 'property'],
      tests: [validate.required, validate.isNumber]
    }
  }
}

class Example extends React.Component {
  render() {
    return <div>hello moto</div>
  }
}

export default Example
