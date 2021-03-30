import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import Clipboard from '@react-native-community/clipboard'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { observable, computed } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Flex, Icon, List, Modal } from '@ant-design/react-native'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { Toast } from '@ant-design/react-native'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import { styles as themeStyles, BGGray } from '../../theme'
import CoinHeader from '../../components/CoinHeader'
import HDAccount from '../../stores/account/HDAccount'
import { HDACCOUNT_FIND_WALELT_TYPE_COINID } from '../../config/const'
import CommonAccount from '../../stores/account/CommonAccount'
import MultiSigAccount from '../../stores/account/MultiSigAccount'

class Receive extends React.Component {
  @computed get accounts() {
    const coin = this.props.navigation.getParam('coin')
    const { accountStore } = this.props
    if (coin.name === 'BTC' || coin.name === 'USDT') {
      return accountStore.HDAccounts
    }
    return accountStore[`${coin.name}Accounts`] || accountStore.accounts
  }

  @computed get accountID() {
    const coin = this.props.navigation.getParam('coin')
    const { accountStore } = this.props
    return accountStore[`current${coin.name}ID`] || accountStore.currentAccountID
  }

  @computed get account() {
    return this.accounts.find(item => item.id === this.accountID)
  }

  @observable selectedCoinID = this.props.navigation.state.params.coinID !== undefined ? this.props.navigation.state.params.coinID : this.wallet.defaultCoin.id

  @computed get wallet() {
    const walletID = this.props.navigation.getParam('walletID')
    let wallet
    if (this.account instanceof HDAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof CommonAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof MultiSigAccount) {
      return this.account.findWallet(walletID)
    }
    return wallet
  }

  @computed get coin() {
    let coin
    if (this.account instanceof HDAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    } else if (this.account instanceof CommonAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    } else if (this.account instanceof MultiSigAccount) {
      return this.wallet.findCoin(this.selectedCoinID)
    }
    return coin
  }

  @computed get address() {
    if (this.coin.name === 'BTC') {
      return this.wallet.currentAddress ? this.wallet.currentAddress.address : this.wallet.address
    } else if (this.coin.name === 'FO' || this.coin.name === 'EOS') {
      return this.wallet.name || this.account.name
    }
    return this.wallet && this.wallet.address
  }

  get sheetOptions() {
    return [strings('wallet-title-address'), strings('wallet-receive-sheet-new-normal'), strings('common-cancel')]
  }

  handleSelectorRef = ref => (this.selector = ref)

  constructor(props) {
    super(props)
    this.state = {
      showOptions: false,
    }
  }

  componentDidMount() {}

  render() {
    const { coin, onSave } = this.props.navigation.state.params
    return (
      <Container>
        <CoinHeader
          coin={coin}
          title={`${strings('wallet.receive')} ${coin.name}`}
          onLeftPress={() => {
            GlobalNavigation.goBack()
            onSave && onSave()
          }}
          renderRight={() => (
            <TouchableOpacity
              style={themeStyles.p8}
              onPress={() => {
                this.setState({
                  showOptions: true,
                })
              }}>
              <Icon name="ellipsis" />
            </TouchableOpacity>
          )}
        />
        <KeyboardAwareScrollView scrollEnabled={true} contentContainerStyle={styles.content}>
          <Flex justify="center" style={styles.QRCode}>
            <QRCode value={this.address} size={256} backgroundColor={BGGray} logoBackgroundColor="transparent" />
          </Flex>
          <View style={styles.addressView}>
            <Text style={styles.addressTitle}>{strings(`Your ${coin.name} address`)}</Text>
          </View>
          <Flex justify="between" style={styles.addressFlex}>
            <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.addressText}>
              {this.address}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(this.address)
                Toast.info(strings('Copied!'))
              }}>
              <Icon name="copy" />
            </TouchableOpacity>
          </Flex>
        </KeyboardAwareScrollView>
        <Modal
          transparent
          visible={this.state.showOptions}
          maskClosable
          onClose={() => {
            this.setState({ showOptions: false })
          }}>
          <List style={{ minHeight: 300 }}>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.newAddress')}
            </List.Item>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.myAddress')}
            </List.Item>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.formatList')}
            </List.Item>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.signMessage')}
            </List.Item>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.showPrivateKey')}
            </List.Item>
            <List.Item arrow="horizontal" extra="" onPress={() => {}}>
              {strings('receive.autoGenAddress')}
            </List.Item>
          </List>
        </Modal>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    ...themeStyles.scrollContent,
    alignItems: 'center',
    borderRadius: 60,
  },
  QRCode: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: BGGray,
    backgroundColor: BGGray,
    padding: 10,
  },
  addressText: {
    width: 280,
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  addressFlex: {
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: BGGray,
    borderColor: '#E4E4E4',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 30,
  },
  addressView: {
    marginTop: 30,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    color: '#707070',
  },
})

export default inject(({ store: state }) => ({
  settings: state.settings,
  accountStore: state.accountStore,
}))(observer(Receive))
