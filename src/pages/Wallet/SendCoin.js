import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, InteractionManager } from 'react-native'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import { util } from '@metamask/controllers'
import { Flex, Toast, Button, Icon, Modal } from '@ant-design/react-native'
import { observable, computed } from 'mobx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import GlobalNavigation from '../../utils/GlobalNavigation'
import CoinHeader from '../../components/CoinHeader'
import { BTCCoin, FO } from '../../stores/wallet/Coin'
import { HDACCOUNT_FIND_WALELT_TYPE_COINID } from '../../config/const'
// import MultiSigWallet from '../../stores/wallet/MultiSigWallet'
import HDAccount from '../../stores/account/HDAccount'
import MultiSigAccount from '../../stores/account/MultiSigAccount'
import Engine from '../../modules/metamask/core/Engine'

import {
  renderFromWei,
  renderFromTokenMinimalUnit,
  weiToFiat,
  balanceToFiat,
  weiToFiatNumber,
  balanceToFiatNumber,
  renderFiatAddition,
  toWei,
  isDecimal,
  toBN,
} from '../../utils/number'
import CommonAccount from '../../stores/account/CommonAccount'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import Ironman from '../../modules/ironman'
import OKClient from '../../modules/okchain'

const { hexToBN, BNToHex } = util

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
    }
  }

  @computed get account() {
    const { accountID } = this.props.navigation.state.params

    const { accountStore } = this.props
    return accountStore.match(accountID)
  }

  @observable amount = -1
  @observable reason = ''
  @observable selectedCoinID = this.props.navigation.state.params.coinID !== undefined ? this.props.navigation.state.params.coinID : this.wallet.defaultCoin.id

  @computed get wallet() {
    const walletID = this.props.navigation.getParam('walletID')

    let wallet
    if (this.account instanceof HDAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof CommonAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    }
    // else if (this.account instanceof MultiSigAccount) {
    //   return this.account.findWallet(walletID);
    // }
    return wallet
  }

  @computed get address() {
    if (this.coin instanceof BTCCoin) {
      return this.wallet.currentAddress ? this.wallet.currentAddress.address : this.wallet.address
    } else if (this.coin instanceof FO) {
      return this.wallet.name || this.account.name
    }
    return this.wallet.address
  }

  @computed get coin() {
    let coin
    if (this.account instanceof HDAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    } else if (this.account instanceof CommonAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0]
    }
    // else if (this.account instanceof MultiSigAccount) {
    //   coin = this.wallet.findCoin(this.selectedCoinID);
    // }
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

  validateGas = () => {
    const { accounts } = this.props
    const {
      transaction: { gas, gasPrice, value, from },
    } = this.props.transaction
    let errorMessage
    const totalGas = gas.mul(gasPrice)
    const valueBN = hexToBN(value)
    const balanceBN = hexToBN(accounts[from].balance)
    if (valueBN.add(totalGas).gt(balanceBN)) {
      errorMessage = strings('transaction.insufficient')
      this.setState({ errorMessage })
    }
    return errorMessage
  }

  /**
   * Removes collectible in case an ERC721 asset is being sent, when not in mainnet
   */
  checkRemoveCollectible = () => {
    const {
      transaction: { selectedAsset, assetType },
      network,
    } = this.props
    if (assetType === 'ERC721' && network !== 1) {
      const { AssetsController } = Engine.context
      AssetsController.removeCollectible(selectedAsset.address, selectedAsset.tokenId)
    }
  }

  /**
   * Validates crypto value only
   * Independent of current internalPrimaryCurrencyIsCrypto
   *
   * @param {string} - Crypto value
   * @returns - Whether there is an error with the amount
   */
  validateAmount = transaction => {
    const {
      accounts,
      contractBalances,
      selectedAsset,
      transaction: {
        paymentChannelTransaction,
        transaction: { gas, gasPrice },
      },
    } = this.props
    const selectedAddress = transaction.from
    let weiBalance, weiInput, errorMessage
    if (isDecimal(transaction.value)) {
      if (paymentChannelTransaction) {
        weiBalance = toWei(Number(selectedAsset.assetBalance))
        weiInput = toWei(transaction.value)
        errorMessage = weiBalance.gte(weiInput) ? undefined : strings('transaction.insufficient')
      } else if (selectedAsset.isETH || selectedAsset.tokenId) {
        const totalGas = gas ? gas.mul(gasPrice) : toBN('0x0')
        weiBalance = hexToBN(accounts[selectedAddress].balance)
        weiInput = hexToBN(transaction.value).add(totalGas)
        errorMessage = weiBalance.gte(weiInput) ? undefined : strings('transaction.insufficient')
      } else {
        const [, , amount] = decodeTransferData('transfer', transaction.data)
        weiBalance = contractBalances[selectedAsset.address]
        weiInput = hexToBN(amount)
        errorMessage = weiBalance && weiBalance.gte(weiInput) ? undefined : strings('transaction.insufficient_tokens', { token: selectedAsset.symbol })
      }
    } else {
      errorMessage = strings('transaction.invalid_amount')
    }
    this.setState({ errorMessage }, () => {
      if (errorMessage) {
        Toast.fail('false')
        // this.scrollView.scrollToEnd({ animated: true });
      }
    })
    return !!errorMessage
  }

  sendAction = async () => {
    const loading = Toast.loading('Loading', 0, () => {
      console.log('Load complete !!!')
    })
    try {
    } catch (e) {}
  }

  transSuccess() {}

  transFail(e) {}

  _refresh(address) {
    this.setState({ receiver: address })
  }

  transferFO = _.throttle(async () => {
    const coin = this.props.navigation.getParam('coin')
    const fibos = Ironman.fibos
    const { receiver, memo, amount } = this.state
    const transactionId = await fibos.transfer(this.address, receiver, `${Number(amount).toFixed(4)} ${coin.name}`, memo)
    if (transactionId) {
      Toast.success(strings('transfer successfully'))
    }
  }, 10000)

  transferOKT = _.throttle(async () => {
    // const coin = this.props.navigation.getParam('coin')
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

  gotoTxHash = _.throttle(async ()=> {
    const tab = this.props.createNewTab(`https://www.oklink.com/okchain-test/tx/${this.state.transactionId}`)
    this.props.setActiveTab(tab.id)
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        this.props.navigation.navigate('DApp');
      }, 300);
    });
  }, 10000)

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
            <TouchableOpacity onPress={() => {}}>
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
            <Text style={{ fontSize: 15, color: '#C4CAD2' }}>{coin.name}</Text>
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
          <Flex justify={'between'} style={styles.fee}>
            <Text style={styles.assetMidText}>Gas Fee</Text>
            <Text style={styles.assetMidText}>0</Text>
          </Flex>
          <Flex style={styles.transactionId}>
            {this.state.transactionId && <TouchableOpacity onPress={this.gotoTxHash}><Text style={styles.hashLink}>txhash:{this.state.transactionId}</Text></TouchableOpacity>}
          </Flex>
          <Button
            type="primary"
            loading={this.state.sending}
            onPress={() => {
              Modal.prompt(
                'Please Confirm your transation password',
                'Save it carefully!',
                async pwd => {
                  const { password } = await SecureKeychain.getGenericPassword()
                  if (password === pwd) {
                    try {
                      this.setState({ sending: true })
                      if (coin.name === 'FO') {
                        this.transferFO()
                      } else if (coin.name === 'OKT') {
                        this.transferOKT()
                      }
                    } catch (e) {
                      console.warn(e)
                    }
                  } else {
                    Toast.info(strings('password incorret'))
                  }
                },
                'secure-text',
                ''
              )
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
    fontSize: 15,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  toFlex: {
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    marginTop: 13,
    marginBottom: 26,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#C4CAD2',
  },
  toInput: {
    flex: 1,
    fontSize: 12,
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
    paddingRight: 10,
    height: 44,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 12,
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
})

export default inject(({ store: state }) => ({
  accountStore: state.accountStore,
  transaction: state.transaction,

  createNewTab: url => state.browser.createNewTab(url),
  setActiveTab: id => state.browser.setActiveTab(id),

}))(observer(SendCoin))
