import React from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { Icon, List } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import { computed } from 'mobx'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'

@inject('store')
@observer
class WalletManagement extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this._refresh()
  }
  
  _refresh = async () => { }

  _setPress = (type, account) => {
    GlobalNavigation.navigate('WalletSetting', {
      type,
      account,
      refresh: () => {
        this._refresh()
      },
    })
  }

  render() {
    const { accountStore } = this.props.store
    return (
      <Container>
        <TitleBar
          title={strings('wallet.walletManagement')}
          renderRight={() => (
            <TouchableOpacity onPress={() => GlobalNavigation.navigate('AddWallet')}>
              <Icon name="appstore-add" />
            </TouchableOpacity>
          )}
        />
        <ScrollView>
          <List renderHeader={strings('wallet.settings')} renderFooter={`Current Wallet:  ${accountStore.currentAccount.name}`}>
            <List.Item
              arrow="horizontal"
              extra=""
              onPress={() => {
                this._setPress('current', accountStore.currentAccount)
              }}>
              {accountStore.currentAccount.name}
            </List.Item>
            {accountStore.accounts
              .filter(account => account.id !== accountStore.currentAccount.id)
              .map((account, index) => (
                <List.Item
                  key={index.toString()}
                  arrow="horizontal"
                  extra={account.walletType || ''}
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

export default WalletManagement
