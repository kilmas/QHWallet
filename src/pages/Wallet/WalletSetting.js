import React from 'react'
import { TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon, List, Button } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import Engine from '../../modules/metamask/core/Engine'
import AccountStorage from '../../stores/account/AccountStorage'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'

@inject('store')
@observer
class WalletSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      wallet: null,
    }
  }

  componentWillMount() {
    this._refresh()
  }

  _refresh = async () => {
    const account = this.props.navigation.getParam('account')
    const { password } = await SecureKeychain.getGenericPassword();
    if (account.type === 7) {
      const data = await AccountStorage.getDataByID(account.id, password)
      this.setState({ account, privateKey: data.privateKey })
    } else {
      const mnemonics = await this.tryExportSeedPhrase(password)
      this.setState({ account, mnemonics })
    }
  }

  tryExportSeedPhrase = async password => {
    const { KeyringController } = Engine.context
    try {
      const mnemonic = await KeyringController.exportSeedPhrase(password)
      const seed = JSON.stringify(mnemonic)
        .replace(/"/g, '')
        .split(' ')
      return seed
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (!this.state.account) {
      return null
    }
    return (
      <Container style={{ backgroundColor: '#FFF' }}>
        <TitleBar
          title={strings('wallet.settings')}
          renderLeft={() => (
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
              }}
              onPress={() => {
                GlobalNavigation.goBack()
                this.props.navigation.state.params.refresh()
              }}>
              <Icon name="left" />
            </TouchableOpacity>
          )}
        />
        <KeyboardAwareScrollView>
          <List renderHeader={this.state.account.name}>
            <List.Item
              arrow="horizontal"
              extra=""
              onPress={() => {

              }}>
              {strings('wallet.changeWalletName')}
            </List.Item>
            <List.Item
              arrow="horizontal"
              onPress={() => {
                GlobalNavigation.navigate('BackupWallet', {
                  mnemonics: this.state.mnemonics,
                  privateKey: this.state.privateKey,
                  account: this.state.account,
                })
              }}>
              {strings('wallet.backupWallet')}
            </List.Item>
            {this.props.navigation.getParam('type') !== 'current' && (
              <List.Item
                arrow="horizontal"
                onPress={() =>
                  GlobalNavigation.navigate('DeleteWallet', {
                    mnemonics: this.state.mnemonics,
                    privateKey: this.state.privateKey,
                    account: this.state.account,
                  })
                }>
                {strings('wallet.deleteWallet')}
              </List.Item>
            )}
          </List>
          <Button type="primary" style={{ marginVertical: 50, marginHorizontal: 20 }} onPress={async () => {
            try {
              await window.showLoading(true)
              const account = this.state.account
              if (account.walletType === 'FO') {
                this.props.store.accountStore.setCurrentFOID(account.id)
              }
              GlobalNavigation.reset('TabDrawer')
            } catch (error) {
            } finally {
              window.hideLoading()
            }
          }}>
            Set as Primary Wallet
          </Button>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

export default WalletSetting