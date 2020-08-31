import 'react-native-gesture-handler'
import React, { Component } from 'react'
import { Provider, ActivityIndicator } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import { Alert, StatusBar, View } from 'react-native'
import routerFun from './router'
import GlobalNavigation from './utils/GlobalNavigation'
import SecureKeychain from './modules/metamask/core/SecureKeychain'
import EntryScriptWeb3 from './modules/metamask/core/EntryScriptWeb3'
import { strings } from './locales/i18n'

global.alert = msg => {
  Alert.alert(
    strings('help'),
    msg,
    [
      {
        text: strings('oK'),
        onPress: () => console.log('OK Pressed'),
      },
    ],
    { cancelable: false }
  )
}

class Entry extends Component {
  constructor(props) {
    super(props)
    SecureKeychain.init(props.qhCode || 'debug')
    // Init EntryScriptWeb3 asynchronously on the background
    EntryScriptWeb3.init()
  }


  routerContainer = () => null


  componentDidMount() { }

  getCurrentRouteName = navigationState => {
    if (!navigationState) {
      return null
    }
    const route = navigationState.routes[navigationState.index]
    if (route.routes) {
      return this.getCurrentRouteName(route)
    }
    return route.routeName
  }

  onNavigationStateChange = (prevState, currentState) => {
    const currentScene = this.getCurrentRouteName(currentState)
    const previousScene = this.getCurrentRouteName(prevState)

    if (previousScene !== currentScene) {
      // window.hideLoading()
    }
  }

  render() {
    const { settings: { initialRouteName } = {} } = this.props
    const RouterContainer = routerFun(initialRouteName)
    return (
      <Provider>
        <StatusBar animated translucent barStyle="dark-content" backgroundColor="rgba(0,0,0,0)" />
        {!!RouterContainer ? <RouterContainer
          ref={navigatorRef => {
            GlobalNavigation.setTopLevelNavigator(navigatorRef)
          }}
          onNavigationStateChange={this.onNavigationStateChange}
        /> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator /></View>
        }
      </Provider>
    )
  }
}

export default inject(({ store: state }) => ({
  settings: state.settings,
}))(observer(Entry))

