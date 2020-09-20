import React from 'react'
import { Image, ActivityIndicator } from 'react-native'
import { when } from 'mobx'
import { inject, observer } from 'mobx-react'
import Container from '../../components/Container'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { styles as themeStyles } from '../../theme'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import Engine from '../../modules/metamask/core/Engine'
import AppInfo from '../../modules/common/AppInfo'

@inject('store')
@observer
class Splash extends React.Component {
  componentDidMount() {
    // SecureKeychain.resetGenericPassword()
    const { accountStore } = this.props.store
    when(
      () => accountStore.isInit,
      () => {
        this.goNext(true, accountStore.currentAccount)
      }
    )
    this.goNext(accountStore.isInit, accountStore.currentAccount)
    AppInfo.checkUpdate()
  }

  goNext = async (isInit, currentAccount) => {
    if (isInit) {
      if (currentAccount) {
        try {
          const credentials = await SecureKeychain.getGenericPassword()
          if (credentials) {
            const { accountStore } = this.props.store
            accountStore.setPwd(true)
            accountStore.checkHdAccount()
            const { KeyringController } = Engine.context
            KeyringController.submitPassword(credentials.password)
            GlobalNavigation.reset('TabDrawer')
          }
        } catch (error) {
          console.warn(error)
        }
        return
      }
      GlobalNavigation.reset('Welcome')
    }
  }

  render() {
    const { accountStore } = this.props.store

    return (
      <Container style={themeStyles.center}>
        {!accountStore.isInit ? <ActivityIndicator /> : <Image source={require('../../images/starting.png')} resizeMode="contain" />}
      </Container>
    )
  }
}

export default Splash
