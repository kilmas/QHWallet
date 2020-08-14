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
import { ACCOUNT_TYPE_HD, ACCOUNT_TYPE_COMMON } from '../../config/const'

@inject('store')
@observer
class WalletSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      wallet: null,
      // mnemonics: []
    }
  }

  componentWillMount() {
    this._refresh()
  }

  _refresh = async () => {
    const account = this.props.navigation.getParam('account')
    const { password } = await SecureKeychain.getGenericPassword()
    if (account.type === ACCOUNT_TYPE_COMMON) {
      const data = await AccountStorage.getDataByID(account.id, password)
      this.setState({ account, privateKey: data.privateKey })
    } else {
      const data = await AccountStorage.getDataByID(account.id, password)
      this.setState({
        account,
        mnemonics: JSON.stringify(data.mnemonic)
          .replace(/"/g, '')
          .split(' '),
      })
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
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
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
          <Button
            type="primary"
            disabled={this.state.loading}
            loading={this.state.loading}
            style={{ marginVertical: 50, marginHorizontal: 20 }}
            onPress={async () => {
              try {
                this.setState({ loading: true })
                const { accountStore } = this.props.store
                const account = this.state.account
                if (account.walletType === 'FO') {
                  accountStore.setCurrentFOID(account.id)
                } else if (account.walletType === 'OKT') {
                  accountStore.setCurrentOKTID(account.id)
                } else if (account.type === ACCOUNT_TYPE_HD) {
                  accountStore.setCurrentID(account.id)
                  const { password } = await SecureKeychain.getGenericPassword()
                  // console.log(this.state.mnemonics.join(' '))
                  this.props.store.engine.importMetamask(password, this.state.mnemonics.join(' '))
                }
                GlobalNavigation.reset('TabDrawer')
              } catch (error) {
                console.warn(error)
              } finally {
                this.setState({ loading: false })
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
