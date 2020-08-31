import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import { util } from '@metamask/controllers'
import { Flex, Toast, Button, Icon, Modal, Slider } from '@ant-design/react-native'
import { observable, computed } from 'mobx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BigNumber from 'bignumber.js'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import GlobalNavigation from '../../utils/GlobalNavigation'
import CoinHeader from '../../components/CoinHeader'
import { BTCCoin, FO } from '../../stores/wallet/Coin'
import { HDACCOUNT_FIND_WALELT_TYPE_COINID, BITCOIN_SATOSHI } from '../../config/const'
// import MultiSigWallet from '../../stores/wallet/MultiSigWallet'
import HDAccount from '../../stores/account/HDAccount'
import MultiSigAccount from '../../stores/account/MultiSigAccount'
import CommonAccount from '../../stores/account/CommonAccount'
import Ironman from '../../modules/ironman'
import OKClient from '../../modules/okchain'
import { BDCoLor } from '../../theme'
import { btcRequest } from '../../utils/request'
import { toFixedNumber, toPriceString } from '../../utils/NumberUtil'
import CoinStore from '../../stores/wallet/CoinStore'
import { goBrowser } from '../../utils/common'
import { authSubmit } from '../../utils/keychain'

const { BNToHex } = util

class SendCoin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      fromSelectedAddress: this.props.transaction.transaction.from,
      receiver: '',
      coin: '',
      amount: '',
      assetId: '',
      balance: 0,
      memo: '',
      gasFee: 1,
      maxFee: 4,
    }
  }

  @computed get accounts() {
    const coin = this.props.navigation.getParam('coin')
    const { accountStore } = this.props
    if (coin.name === 'FO') {
      return accountStore.FOAccounts
    } else if (coin.name === 'ETH') {
      return accountStore.ETHAccounts
    } else if (coin.name === 'OKT') {
      return accountStore.OKTAccounts
    } else if (coin.name === 'BTC' || coin.name === 'USDT') {
      return accountStore.HDAccounts
    }
    return []
  }

  @computed get accountID() {
    const coin = this.props.navigation.getParam('coin')
    const { accountStore } = this.props
    if (coin.name === 'FO') {
      return accountStore.currentFOID
    } else if (coin.name === 'ETH') {
      return accountStore.currentETHID
    } else if (coin.name === 'BTC' || coin.name === 'USDT') {
      return accountStore.currentAccountID
    } else if (coin.name === 'OKT') {
      return accountStore.currentOKTID
    }
    return null
  }

  @computed get account() {
    return this.accounts.find(item => item.id === this.accountID)
  }

  @observable amount = -1
  @observable reason = ''
  @observable selectedCoinID = this.props.navigation.getParam('coinID')

  @computed get wallet() {
    let wallet
    if (this.account instanceof HDAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof CommonAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof MultiSigAccount) {
      const walletID = this.props.navigation.getParam('walletID')
      return this.account.findWallet(walletID);
    }
    return wallet
  }

  @computed get address() {
    if (this.coin.name === 'BTC') {
      return this.wallet.currentAddress ? this.wallet.currentAddress.address : this.wallet.address;
    } else if(this.coin.name === 'FO') {
      return (this.wallet && this.wallet.name) || (this.account && this.account.name)
    }
    return this.wallet && this.wallet.address
  }

  @computed get coin() {
    let coin
    if (this.account instanceof HDAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    } else if (this.account instanceof CommonAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    } else if (this.account instanceof MultiSigAccount) {
      coin = this.wallet.findCoin(this.selectedCoinID);
    }
    return coin
  }

  prepareTransactionToSend = () => {
    const {
      transaction: { transaction },
    } = this.props
    const { fromSelectedAddress } = this.state
    const transactionToSend = { ...transaction }
    transactionToSend.gas = BNToHex(transaction.gas)
    transactionToSend.gasPrice = BNToHex(transaction.gasPrice)
    transactionToSend.from = fromSelectedAddress
    return transactionToSend
  }

  validateGas = () => { }

  /**
   * Removes collectible in case an ERC721 asset is being sent, when not in mainnet
   */
  checkRemoveCollectible = () => { }

  /**
   * Validates crypto value only
   * Independent of current internalPrimaryCurrencyIsCrypto
   *
   * @param {string} - Crypto value
   * @returns - Whether there is an error with the amount
   */
  validateAmount = transaction => { }

  sendAction = async (coin) => {
    try {
      this.setState({ sending: true })
      if (coin.name === 'FO') {
        this.transferFO()
      } else if (coin.name === 'OKT') {
        this.transferOKT()
      } else if (coin.name === 'BTC') {
        const txHex = await this.wallet.sendTransaction(this.state.receiver, parseInt(Number(this.state.amount) * BITCOIN_SATOSHI), this.state.gasFee, password)
        if (txHex)
          Toast.info('Push transaction successfully')
        else {
          Toast.fail('transfer fail')
        }
        this.setState({ sending: false })
      }
    } catch (e) {
      console.warn(e)
    }
  }

  getRecommendFee = () => {
    btcRequest.recommended().then(res => {
      this.setState({ gasFee: res.fastestFee, maxFee: res.fastestFee * 2 })
    })
  }
  componentDidMount = () => {
    this.getRecommendFee()
  }

  _refresh(address) {
    this.setState({ receiver: address })
  }

  transferFO = _.throttle(async () => {
    const coin = this.props.navigation.getParam('coin')
    const fibos = Ironman.fibos
    const { receiver, memo, amount } = this.state
    const transaction = await fibos.transfer(this.address, receiver, `${Number(amount).toFixed(4)} ${coin.name}`, memo)
    const { transaction_id: transactionId = '' } = transaction
    if (transactionId) {
      this.setState({ transactionId, sending: false })
      Toast.success(strings('transfer successfully'))
    }
  }, 10000)

  transferOKT = _.throttle(async () => {
    const { oKClient } = OKClient
    const { receiver, memo, amount } = this.state
    const transaction = await oKClient.sendSendTransaction(receiver, Number(amount).toFixed(8), 'tokt', memo)
    console.log(transaction)
    if (transaction) {
      const {
        result: { txhash: transactionId },
      } = transaction
      if (this.wallet.getBalance) {
        console.log('getBalance')
        this.wallet.getBalance()
      }
      this.setState({ transactionId, sending: false })
      Toast.success(strings('transfer successfully'))
    }
  }, 10000)

  gotoTxHash = async () => {
    const coin = this.props.navigation.getParam('coin')
    let browserUrl
    if (coin.name === 'FO') {
      browserUrl = `https://see.fo/transactions/${this.state.transactionId}`
    } else if (coin.name === 'OKT') {
      browserUrl = `https://www.oklink.com/okchain-test/tx/${this.state.transactionId}`
    }
    if (browserUrl) {
      goBrowser(this.props.navigation, browserUrl)
    }
  }

  handleGasChange = (value) => {
    console.log(value)
    this.setState({ gasFee: value })
  }

  get gasFee() {
    const { fee } = this.wallet && this.wallet.transationData(this.state.receiver, this.state.amount, this.state.gasFee)
    const totalPrice = toFixedNumber(new BigNumber(fee).div(BITCOIN_SATOSHI).multipliedBy(`${this.price}`), 2);
    return `${fee} sat  ≈ ${toPriceString(totalPrice, 2, 4, true)} ${CoinStore.currencySymbol}`;
  }

  @computed get price() {
    const coin = this.props.navigation.getParam('coin')
    return (CoinStore[`${coin.name}Price`] || 0)
  }

  render() {
    const coin = this.props.navigation.getParam('coin')

    const { amount, memo } = this.state
    return (
      <Container style={styles.container}>
        <CoinHeader
          title={`Transfer ${coin.name}`}
          coin={coin}
          onLeftPress={() => {
            GlobalNavigation.goBack()
            const { onSave } = this.props.navigation.state.params
            onSave && onSave()
          }}
        />
        <KeyboardAwareScrollView scrollEnabled contentContainerStyle={styles.content}>
          <Flex justify={'between'} style={styles.toFlex}>
            <TextInput
              style={styles.toInput}
              numberOfLines={1}
              placeholder={strings('Send Address')}
              onChangeText={text => {
                this.setState({ send: text })
              }}
              value={this.address}
            />
            <TouchableOpacity onPress={() => { }}>
              <Icon name="down" />
            </TouchableOpacity>
          </Flex>
          <Flex justify={'between'} style={styles.toFlex}>
            <TextInput
              style={styles.toInput}
              numberOfLines={1}
              placeholder={strings('Receiver Address')}
              onChangeText={text => {
                this.setState({ receiver: text })
              }}
              value={this.state.receiver}
            />
            <TouchableOpacity
              onPress={() =>
                GlobalNavigation.navigate('ScanQRCode', {
                  onSave: address => {
                    this._refresh(address)
                  },
                })
              }>
              <Icon name="scan" />
            </TouchableOpacity>
            <View style={styles.line} />
            <TouchableOpacity
              onPress={() =>
                GlobalNavigation.navigate('Contacts', {
                  mode: 'get',
                  onSave: address => {
                    this._refresh(address)
                  },
                })
              }>
              <Icon name="contacts" />
            </TouchableOpacity>
          </Flex>
          <Flex justify={'between'} style={styles.amountFlex}>
            <TextInput
              style={styles.amountInput}
              numberOfLines={1}
              keyboardType={'decimal-pad'}
              placeholder={strings('input Amount')}
              value={amount}
              onChangeText={amount => {
                this.setState({
                  amount,
                })
              }}
              keyboardType="numeric"
            />
            <Text style={styles.coinName}>{coin.name}</Text>
          </Flex>
          <Flex justify={'between'} style={styles.amountFlex}>
            <TextInput
              style={styles.amountInput}
              keyboardType={'decimal-pad'}
              placeholder={strings('memo')}
              value={memo}
              onChangeText={memo => {
                this.setState({
                  memo,
                })
              }}
            />
          </Flex>
          {
            (coin.name === 'BTC' || coin.name === 'USDT') && <View>
              <Flex justify={'between'} style={styles.fee}>
                <Text style={styles.assetMidText}>Gas Fee</Text>
                <Flex>
                  <Text style={styles.assetMidText}>{this.gasFee}</Text>
                  <TouchableOpacity onPress={() => {
                    this.setState(state => ({ setGas: !state.setGas }))
                  }}><Icon name={this.state.setGas ? "up" : "down"} /></TouchableOpacity>
                </Flex>
              </Flex>
              {
                this.state.setGas && <React.Fragment>
                  <View style={{ height: 30, justifyContent: 'center' }}>
                    <Slider
                      min={0}
                      step={1}
                      defaultValue={this.state.gasFee}
                      max={this.state.maxFee}
                      onChange={value => this.handleGasChange(value)}
                    />
                  </View>
                  <Flex align="center" justify="between">
                    <Text>
                      {this.state.gasFee} sat/b
                  </Text>
                    <TouchableOpacity style={styles.recommendBtn} onPress={this.getRecommendFee}><Text style={{ color: BDCoLor }}>recommended gas</Text></TouchableOpacity>
                  </Flex>
                </React.Fragment>
              }

            </View>
          }
          <Flex style={styles.transactionId}>
            {this.state.transactionId && <TouchableOpacity onPress={this.gotoTxHash}><Text style={styles.hashLink}>txhash:{this.state.transactionId}</Text></TouchableOpacity>}
          </Flex>
          <Button
            type="primary"
            loading={this.state.sending}
            disabled={this.state.sending}
            onPress={() => {
              authSubmit((err, pwd) => {
                if (err) {
                  Toast.fail(err)
                  return
                }
                this.sendAction(coin)
              })
            }}>
            {strings('next')}
          </Button>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8F9',
  },
  content: {
    padding: 26,
  },
  assetMidText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 5
  },
  toFlex: {
    height: 44,
    paddingHorizontal: 5,
    backgroundColor: '#FFF',
    marginTop: 13,
    marginBottom: 26,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#C4CAD2',
  },
  toInput: {
    flex: 1,
    fontSize: 11,
    color: '#000000',
  },
  line: {
    width: 0.5,
    height: 25,
    backgroundColor: '#BFBFBF',
    marginHorizontal: 11,
  },
  amountFlex: {
    backgroundColor: '#FFF',
    marginTop: 13,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#C4CAD2',
    paddingRight: 5,
    height: 44,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 11,
    borderRadius: 5,
    color: '#000000',
  },
  fee: {
    marginVertical: 25,
  },
  transactionId: {
    marginBottom: 20
  },
  hashLink: {
    color: 'blue',
    textDecorationLine: 'underline'
  },
  coinName: { fontSize: 14, color: '#C4CAD2' },
  recommendBtn: { borderRadius: 5, borderWidth: 0.5, borderColor: BDCoLor, padding: 5 }
})

export default inject(({ store: state }) => ({
  accountStore: state.accountStore,
  transaction: state.transaction,

  createNewTab: url => state.browser.createNewTab(url),
  setActiveTab: id => state.browser.setActiveTab(id),

}))(observer(SendCoin))
