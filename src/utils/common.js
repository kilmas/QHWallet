import { InteractionManager } from 'react-native'
import _ from 'lodash'

export const goBrowser = _.throttle((navigation, browserUrl) => {
  navigation.navigate('Browser')
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      navigation.navigate('DApp', {
        newTabUrl: browserUrl,
      })
    }, 300)
  })
}, 8000)
