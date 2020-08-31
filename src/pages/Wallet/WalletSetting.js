import React from 'react'
import { TouchableOpacity, InteractionManager } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon, List, Button } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import { computed } from 'mobx'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import Engine from '../../modules/metamask/core/Engine'
import AccountStorage from '../../stores/account/AccountStorage'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import { ACCOUNT_TYPE_HD, ACCOUNT_TYPE_COMMON } from '../../config/const'

class WalletSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      wallet: null,
      // mnemonics: []
    }
  }

  @computed get account() {
    const account = this.props.navigation.getParam('account')
    return account
  }

  @computed get current() {
    const { accountStore: {
      currentETHID, currentFOID, currentOKTID
    } } = this.props
    const { id } = this.account
    if (id === currentFOID
      || id === currentETHID
      || id === currentETHID
      || this.props.navigation.getParam('type') === 'current')
      return true
  }

  _refresh = async () => {
    const account = this.account
    const { password } = await SecureKeychain.getGenericPassword()
    if (account.type === ACCOUNT_TYPE_COMMON) {
      const data = await AccountStorage.getDataByID(account.id, password)
      this.setState({ account, privateKey: data.privateKey })
    } else {
      const data = await AccountStorage.getDataByID(account.id, password)
      this.setState({
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

  isImported(allKeyrings, address) {
    let ret = false;
    for (const keyring of allKeyrings) {
      if (keyring.accounts.includes(address)) {
        ret = keyring.type !== 'HD Key Tree';
        break;
      }
    }

    return ret;
  }


  onAccountChange = async address => {
    const { PreferencesController } = Engine.context;
    const { keyrings } = this.props;
    console.log(keyrings)

    requestAnimationFrame(async () => {
      try {
        console.log(address)
        PreferencesController.setSelectedAddress(address);

        InteractionManager.runAfterInteractions(async () => {
          setTimeout(() => {
            Engine.refreshTransactionHistory();
          }, 1000);
        });
      } catch (e) {
        console.error(e, 'error while trying change the selected account'); // eslint-disable-line
      }
    });
  };

  componentDidMount () {
    this._refresh()
  }
  
  render() {
    if (!this.account) {
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
          <List renderHeader={this.account.name}>
            <List.Item arrow="horizontal" extra="" onPress={() => { }}>
              {strings('wallet.changeWalletName')}
            </List.Item>
            <List.Item
              arrow="horizontal"
              onPress={() => {
                GlobalNavigation.navigate('BackupWallet', {
                  mnemonics: this.state.mnemonics,
                  privateKey: this.state.privateKey,
                  account: this.account,
                })
              }}>
              {strings('wallet.backupWallet')}
            </List.Item>
            {!this.current && (
              <List.Item
                arrow="horizontal"
                onPress={() =>
                  GlobalNavigation.navigate('DeleteWallet', {
                    mnemonics: this.state.mnemonics,
                    privateKey: this.state.privateKey,
                    account: this.account,
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
                const { accountStore } = this.props
                const account = this.account
                if (account.walletType === 'FO') {
                  accountStore.setCurrentFOID(account.id)
                } else if (account.walletType === 'OKT') {
                  accountStore.setCurrentOKTID(account.id)
                } else if (account.walletType === 'ETH') {
                  const { address } = account.ETHWallet
                  if (address) {
                    this.onAccountChange(address)
                  }
                  accountStore.setCurrentETHID(account.id)
                } else if (account.type === ACCOUNT_TYPE_HD) {
                  accountStore.setCurrentID(account.id)
                  const { password } = await SecureKeychain.getGenericPassword()
                  // console.log(this.state.mnemonics.join(' '))
                  this.props.importMetamask(this.state.mnemonics.join(' '), password, false)
                  setTimeout(() => {
                    const { address } = account.ETHWallet
                    if (address) {
                      this.onAccountChange(address)
                    }
                    accountStore.setCurrentETHID(account.id)
                  }, 1000)
                }
                // GlobalNavigation.reset('TabDrawer')
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


export default inject(({ store: state }) => ({
  settings: state.settings,
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,

  accountStore: state.accountStore,
  importMetamask: state.engine.importMetamask,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
  identities: state.engine.backgroundState.PreferencesController.identities,
  keyrings: state.engine.backgroundState.KeyringController.keyrings,
  // identities: state.engine.backgroundState.PreferencesController.identities,

}))(observer(WalletSetting))
