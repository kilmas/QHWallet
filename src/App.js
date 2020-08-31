import 'react-native-gesture-handler'
import 'crypto-js'
import 'mobx-react-lite/batchingForReactNative'
import React from 'react'
import { Platform } from 'react-native'
import { Provider as Mobx } from 'mobx-react'
import rootStore from './stores'
import Entry from './entry'

Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
})

console.disableYellowBox = true

class App extends React.Component {
  render() {
    return (
      <Mobx store={rootStore}>
        <Entry />
      </Mobx>
    )
  }
}

export default App
