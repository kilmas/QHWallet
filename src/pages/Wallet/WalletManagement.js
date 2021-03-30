import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Icon, List } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import { styles as themeStyles } from '../../theme'

class WalletManagement extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this._refresh()
  }

  _refresh = async () => {}

  _setPress = (type, account) => {
    GlobalNavigation.navigate('WalletSetting', {
      type,
      account,
      refresh: () => {
        this._refresh()
      },
    })
  }

  extraAccount = (walletType, id) => {
    const { accountStore } = this.props
    if (id === accountStore[`current${walletType}ID`]) {
      return `Current ${walletType}`
    }
    return walletType || 'HD'
  }

  render() {
    const { accountStore } = this.props
    return (
      <Container>
        <TitleBar
          title={strings('wallet.walletManagement')}
          renderRight={() => (
            <TouchableOpacity style={themeStyles.p8} onPress={() => GlobalNavigation.navigate('AddWallet')}>
              <Icon name="appstore-add" />
            </TouchableOpacity>
          )}
        />
        <ScrollView>
          <List renderHeader={strings('wallet.settings')} renderFooter={`Current Wallet:  ${accountStore.currentAccount.name}`}>
            <List.Item
              arrow="horizontal"
              extra="Current HD"
              onPress={() => {
                this._setPress('current', accountStore.currentAccount)
              }}>
              {accountStore.currentAccount.name}
            </List.Item>
            {accountStore.accounts
              .filter(account => account.id !== accountStore.currentAccountID)
              .map((account, index) => (
                <List.Item
                  key={index.toString()}
                  arrow="horizontal"
                  extra={this.extraAccount(account.walletType, account.id)}
                  onPress={() => {
                    this._setPress('other', account)
                  }}>
                  {account.name}
                </List.Item>
              ))}
          </List>
        </ScrollView>
      </Container>
    )
  }
}

export default inject(({ store: state }) => ({
  settings: state.settings,
  accountStore: state.accountStore,
  identities: state.engine.backgroundState.PreferencesController.identities,
}))(observer(WalletManagement))
