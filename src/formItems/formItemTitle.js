import React from 'react'
import { lastToNbsp } from 'utilities/stringUtils'

import { View, Text, Spacer } from '.'
import Loadable from 'react-loadable'

const Tooltip = Loadable({
  loader: () => import(/* webpackChunkName: "Tooltip" */ 'react-zeolite/Tooltip'),
  loading: () => null
})

const FormItemTitle = props => {
  const { title, tooltip } = props

  return (
    <View>
      <View key="title" horizontal>
        <Text style={{ width: '100%' }}>
          {typeof tipText === 'string' ? <Text>{lastToNbsp(title)}</Text> : title}
          {tooltip && <Tooltip tipText={tooltip} />}
        </Text>
      </View>
      <Spacer key="spacer" mobileSize="xsmall" />
    </View>
  )
}

export default FormItemTitle
