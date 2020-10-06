import React from 'react'
import { TouchableOpacity, StyleSheet, Text, View, Platform } from 'react-native'
import { Flex, Radio, List, Icon, Modal, Tabs, Button, InputItem, Picker, Toast } from '@ant-design/react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Clipboard from '@react-native-community/clipboard'
import { inject, observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import WebView from 'react-native-webview'
import _ from 'lodash'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import GlobalNavigation from '../../utils/GlobalNavigation'
import CoinHeader from '../../components/CoinHeader'
import AssetsAction from './components/AssetsAction'
// import MultiSigWallet from '../../stores/wallet/MultiSigWallet'
import HDAccount from '../../stores/account/HDAccount'
import { HDACCOUNT_FIND_WALELT_TYPE_COINID } from '../../config/const'
import MultiSigAccount from '../../stores/account/MultiSigAccount'
import { weiToFiat, hexToBN, renderFromWei } from '../../utils/number'
import Tokens from '../../components/UI/Tokens'
import { getTicker } from '../../utils/transactions'
import Ironman from '../../modules/ironman'
import resolveRegister, { contractRegister } from '../../modules/metamask/cross'
import Engine from '../../modules/metamask/core/Engine'
import CommonAccount from '../../stores/account/CommonAccount'
// import { FO, BTCCoin } from '../../stores/wallet/Coin'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import { goBrowser } from '../../utils/common'

const RadioItem = Radio.RadioItem

const crossTokens = [
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
  },
  {
    address: '0x31406738536309754f39E4A80E3d6A321a01568C',
    decimals: 18,
    symbol: 'ETH',
    isETH: true,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
  },
  {
    address: '0x1c48f86ae57291f7686349f12601910bd8d470bb',
    decimals: 18,
    symbol: 'USDK',
  },
  {
    address: '0x75231F58b43240C9718Dd58B4967c5114342a86c',
    decimals: 18,
    symbol: 'OKB',
  },
]
class History extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      crossToken: 0,
      fibosAccount: '',
      oktAccount: '',
      showAddressType: '44',
    }
  }

  @observable selectedCoinID = this.props.navigation.getParam('coinID')

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

  /**
   * @type {HDAccount}
   *
   * @memberof CoinDetailScreen
   */
  @computed get account() {
    return this.accounts.find(item => item.id === this.accountID)
    // const { accountStore } = this.props
    // return accountStore.match(this.accountID)
  }

  componentDidMount = () => {
    const coin = this.props.navigation.getParam('coin')
    if (coin.name === 'FO') {
      if (this.account instanceof HDAccount) {
        const password = SecureKeychain.getInstance().getPassword()
        this.account.checkFOAccount(password)
      }
    }
    // else if (coin.name === 'BTC') {
    //   this.wallet && this.wallet.getUtxos()
    // }
  }
  /**
   *
   * @type {Wallet}
   * @memberof CoinDetailScreen
   */
  @computed get wallet() {
    let wallet
    if (this.account instanceof HDAccount) {
      wallet = this.account.findWallet(this.selectedCoinID, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof CommonAccount) {
      wallet = this.account.findWallet(this.selectedCoinID, HDACCOUNT_FIND_WALELT_TYPE_COINID)
    } else if (this.account instanceof MultiSigAccount) {
      wallet = this.account.findWallet(this.props.walletID)
    }
    return wallet
  }

  @computed get browserRecord() {
    if (this.wallet) return this.wallet.browserRecord
    return 'https://cn.etherscan.com/'
  }

  @computed get address() {
    if (this.coin.name === 'BTC') {
      return this.wallet.currentAddress ? this.wallet.currentAddress.address : this.wallet.address
    } else if (this.coin.name === 'FO' || this.coin.name === 'EOS') {
      return (this.wallet && this.wallet.name) || (this.account && this.account.name)
    }
    return this.wallet && this.wallet.address
  }
  /**
   * @type {Coin}
   * @readonly
   * @memberof CoinDetailScreen
   */
  @computed get coin() {
    let coin
    if (this.account instanceof HDAccount) {
      coin = this.account.findCoin(this.selectedCoinID)
    } else if (this.account instanceof MultiSigAccount) {
      coin = this.account.findCoin(this.selectedCoinID)
    } else if (this.account instanceof CommonAccount) {
      coin = this.account.findCoin(this.selectedCoinID)
    }
    return coin
  }

  @computed get txStore() {
    return this.wallet.txStore
  }

  @computed get txSet() {
    return this.txStore.coinTxSet(this.selectedCoinID)
  }

  @observable isRefreshing = false
  @observable isLoadingMore = false

  /**
   * 0: 全部
   * 1: 转入
   * 2: 转出
   * 3: 失败
   *
   * @memberof CoinDetailScreen
   */
  @observable txType = 0

  @computed get txs() {
    let txs
    switch (this.txType) {
      case 0:
        txs = this.txSet.allTxs
        break
      case 1:
        txs = this.txSet.inTxs
        break
      case 2:
        txs = this.txSet.outTxs
        break
      case 3:
        txs = this.txSet.failedTxs
        break
    }
    return txs
  }

  @computed get title() {
    return `${this.coin.name}`
  }

  onSave = () => {}

  register = () => {
    this.props.resetTransaction()
    const transation = resolveRegister({
      account: this.state.fibosAccount,
    })
    console.log(transation)
    this.props.setTransactionObject({
      ...transation,
      from: this.props.selectedAddress,
      value: '0x0',
    })
    this.setState({ showCross: false }, () => {
      this.props.navigation.navigate('Confirm')
    })
  }

  registerApprove = _.throttle(async () => {
    const { provider } = Engine.context.NetworkController
    contractRegister({
      provider,
      account: this.state.fibosAccount,
      from: this.props.selectedAddress,
    })
    this.setState({ showCross: false })
  }, 5000)

  checkFibosAccount = async account => {
    const fibos = Ironman.fibos
    if (fibos) {
      try {
        const response = await fibos.getAccount(account)
        if (_.get(response, 'account_name') === account) {
          this.setState({ accountError: false }, () => {
            this.checkMapState(account)
          })
        }
      } catch (error) {
        console.warn(error)
        Toast.fail(strings('Fibos account is not exist'))
        this.setState({ accountError: true })
      }
    }
  }

  checkMapState = async fibosaccount => {
    const fibos = Ironman.fibos
    const { selectedAddress = '' } = this.props
    if (fibos) {
      try {
        const reponse = await fibos.getTableRows({ json: true, code: 'eosio.cross', scope: 'eosio.cross', table: 'accountmap', limit: 5000 })
        const { rows } = reponse

        let tmp_isFibosAccountValid = false
        rows.forEach(item => {
          if (!tmp_isFibosAccountValid && item.account === fibosaccount) {
            if (item.eth_address.indexOf(selectedAddress.split('0x')[1].toLocaleLowerCase()) !== -1) {
              tmp_isFibosAccountValid = true
            }
          }
        })
        this.setState({ isFibosAccountValid: tmp_isFibosAccountValid })
        console.log('tmp_isFibosAccountValid', tmp_isFibosAccountValid)
        if (!tmp_isFibosAccountValid) {
          this.setState({ crossInfo: `${fibosaccount} should register to eth at first!` })
          Toast.info('Current fibos account has not map to eth', 1)
        } else {
          this.setState({ crossInfo: '' })
        }
      } catch (error) {
        console.warn(error)
      }
    }
  }

  componentWillUnmount() {
    Toast.removeAll()
  }

  onCopyPubKey = async () => {
    const { password } = await SecureKeychain.getGenericPassword()
    const mnemonic = await this.account.exportMnemonic(password)
    const publicKey = this.wallet.getPublicKey(mnemonic)
    Clipboard.setString(publicKey)
    Toast.info(publicKey)
  }

  render() {
    const coin = this.props.navigation.getParam('coin')
    const { name = '', icon } = coin
    const availiableBalance = 100
    const btcPrice = 10000

    const { accounts, conversionRate, currentCurrency, identities, selectedAddress, tokens, collectibles, navigation, ticker } = this.props

    let balance = 0
    let assets = tokens
    if (accounts[selectedAddress]) {
      balance = renderFromWei(accounts[selectedAddress].balance)
      assets = [
        {
          name: 'Ether',
          symbol: getTicker(ticker),
          isETH: true,
          balance,
          balanceFiat: weiToFiat(hexToBN(accounts[selectedAddress].balance), conversionRate, currentCurrency),
          logo: '../../images/eth-logo.png',
        },
        ...tokens,
      ]
    } else {
      assets = tokens
    }
    // const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] }

    let actions = {
      onTransfer: () => {
        GlobalNavigation.navigate('SendCoin', {
          coin: this.coin,
          onSave: this.onSave,
          walletID: this.props.walletID,
          coinID: this.selectedCoinID,
        })
      },
      onReceive: () => {
        GlobalNavigation.navigate('Receive', {
          coin: this.coin,
          walletID: this.props.walletID,
          coinID: this.selectedCoinID,
        })
      },
    }

    if (coin.name === 'ETH') {
      actions = {
        onCross: () => {
          this.setState(
            state => {
              const {
                accountStore: { FOAccounts, currentFOID },
              } = this.props
              if (state.fibosAccount === '' && FOAccounts.length) {
                const account = FOAccounts.find(item => item.id === currentFOID)
                return {
                  fibosAccount: account.FOWallet.name,
                  showCross: true,
                  crossType: 'FO',
                }
              }
              return {
                showCross: true,
                crossType: 'FO',
              }
            },
            () => {
              if (this.state.fibosAccount) {
                this.checkFibosAccount(this.state.fibosAccount)
              }
            }
          )
        },
        onSwapNetwork: () => {
          this.props.toggleNetworkModal()
        },
        // onCrossOKT: () => {
        //   this.setState(state => {
        //     const {
        //       accountStore: { OKTAccounts, currentOKTID },
        //     } = this.props
        //     if (state.oktAccount === '' && OKTAccounts.length) {
        //       const account = OKTAccounts.find(item => item.id === currentOKTID)
        //       return {
        //         oktAccount: account.OKTWallet.address,
        //         showCross: true,
        //         crossType: 'OKT',
        //       }
        //     }
        //     return {
        //       showCross: true,
        //       crossType: 'OKT',
        //     }
        //   })
        // },
      }
    } else if (coin.name === 'FO') {
      if (!this.wallet.hasCreated) {
        actions = {
          onCopyPubKey: this.onCopyPubKey,
          onCreate: () => goBrowser(this.props.navigation, `https://see.fo/tools/create`),
        }
      } else {
        actions = {
          ...actions,
          onTools: () => goBrowser(this.props.navigation, `https://see.fo/tools`),
        }
      }
    } else if (coin.name === 'EOS') {
      if (!this.wallet.hasCreated) {
        actions = {
          onCopyPubKey: this.onCopyPubKey,
          onCreate: () => goBrowser(this.props.navigation, `https://bloks.io/wallet/create-account`),
        }
      } else {
        actions = {
          ...actions,
          onTools: () => goBrowser(this.props.navigation, `https://bloks.io/wallet/transfer`),
        }
      }
    } else if (coin.name === 'OKT') {
      actions = {
        ...actions,
        onVote: () => {
          GlobalNavigation.navigate('VoteList', {
            address: this.address,
          })
        },
      }
    } else if (coin.name === 'TRX') {
      actions = {
        ...actions,
        onTools: () => goBrowser(this.props.navigation, `https://tronscan.io/#/wallet`),
      }
    }

    return (
      <Container>
        <CoinHeader
          coin={this.coin}
          title={name}
          paramsCoin={name}
          icon={icon}
          availiableBalance={availiableBalance}
          btcPrice={btcPrice}
          currencyUnit={this.props.settings.currency.unit}
          onLeftPress={() => {
            GlobalNavigation.goBack()
          }}
          renderRight={() => (
            <TouchableOpacity
              onPress={() => {
                this.setState({ visible: true })
              }}>
              <Icon name="ellipsis" />
            </TouchableOpacity>
          )}
        />
        <AssetsAction {...actions} />
        <Tabs
          swipeable={false}
          usePaged={false}
          tabs={[{ title: coin.name === 'BTC' ? 'Address' : 'Tokens' }, { title: coin.name === 'ETH' ? 'Collectibles' : 'Records' }]}>
          <View>
            <KeyboardAwareScrollView>
              {coin.name === 'ETH' ? (
                <Tokens navigation={navigation} tabLabel={strings('wallet.tokens')} tokens={assets} />
              ) : coin.name === 'OKT' ? (
                <List>
                  {this.wallet &&
                    this.wallet.coins.map((item, index) => (
                      <List.Item
                        key={item.id}
                        checked={index === 0}
                        onPress={() => {
                          console.log(item)
                        }}>
                        {item.name}
                        <List.Item.Brief>{item.balance}</List.Item.Brief>
                      </List.Item>
                    ))}
                </List>
              ) : (
                coin.name === 'BTC' && (
                  <List>
                    <Modal visible={this.state.visibleAddress} transparent maskClosable onClose={() => {
                      this.setState({ visibleAddress: false })
                    }}>
                      {this.account instanceof HDAccount &&
                        this.wallet.addresses
                          .filter(item => {
                            return item.path.indexOf(this.state.showAddressType) > 0
                          })
                          .map((item, index) => (
                            <List.Item
                              extra={this.wallet.currentAddress && this.wallet.currentAddress.address === item.address ? <Icon name="check" /> : ''}
                              key={index.toString()}
                              checked={index === 0}
                              onPress={() => {
                                Clipboard.setString(item.address)
                                Toast.info(`copy ${item.address} successfully`)
                              }}
                              onLongPress={() => {
                                this.wallet.setCurrentAddress(item)
                              }}>
                              {item.address}
                              <List.Item.Brief>{item.path}</List.Item.Brief>
                            </List.Item>
                          ))}
                    </Modal>
                    <List.Item
                      onPress={() => {
                        this.setState({ visibleAddress: true, showAddressType: '44' })
                      }}>
                      普通地址
                    </List.Item>
                    <List.Item
                      onPress={() => {
                        this.setState({ visibleAddress: true, showAddressType: '49' })
                      }}>
                      隔离验证(兼容)
                    </List.Item>
                    <List.Item
                      onPress={() => {
                        this.setState({ visibleAddress: true, showAddressType: '84' })
                      }}>
                      隔离验证(原生)
                    </List.Item>
                    <List.Item styles={{ column: { alignItems: 'center' } }} onPress={() => {}}>
                      + Reflesh
                    </List.Item>
                  </List>
                )
              )}
            </KeyboardAwareScrollView>
          </View>
          <View style={styles.tabView}>
            {coin.name === 'ETH' ? null : (
              <WebView
                bounces={false}
                directionalLockEnabled
                source={{ uri: `${this.browserRecord}${this.address}` }}
                scrollEnabled={false}
                overScrollMode={'never'}
                sendCookies
                javascriptEnabled
                allowsInlineMediaPlayback
                useWebkit
              />
            )}
          </View>
        </Tabs>
        <Modal
          popup
          visible={this.state.visible}
          animationType="slide-up"
          maskClosable
          onClose={() => {
            this.setState({ visible: false })
          }}>
          <List style={{ minHeight: 300 }} renderHeader={`${name} accounts List.`}>
            {this.accounts.map(item => (
              <RadioItem
                key={item.id}
                checked={item.id === this.accountID}
                onChange={event => {
                  if (event.target.checked) {
                    const { accountStore } = this.props
                    if (coin.name === 'FO') {
                      accountStore.setCurrentFOID(item.id)
                    } else if (coin.name === 'EOS') {
                      accountStore.setCurrentEOSID(item.id)
                    } else if (coin.name === 'OKT') {
                      accountStore.setCurrentOKTID(item.id)
                    } else if (coin.name === 'TRX') {
                      accountStore.setCurrentTRXID(item.id)
                    } else if (coin.name === 'ETH') {
                      accountStore.setCurrentETHID(item.id)
                      accountStore.selectEthAccount(item.ETHWallet.address)
                    }
                  }
                }}>
                {item.name}
              </RadioItem>
            ))}
          </List>
        </Modal>

        <Modal
          popup
          visible={this.state.showCross}
          animationType="slide-up"
          transparent={Platform.OS === 'ios'}
          styles={{
            innerContainer: {
              width: 350,
              paddingTop: 0,
            },
            body: {
              paddingHorizontal: 1,
            },
          }}
          maskClosable
          onClose={() => {
            this.setState({ showCross: false, crossInfo: '' })
          }}>
          <List renderHeader={`Cross to ${this.state.crossType}`} renderFooter={<Text style={{ color: 'blue', margin: 15 }}>{this.state.crossInfo}</Text>}>
            <InputItem error={false} value={this.props.selectedAddress}>
              From:
            </InputItem>
            {this.state.crossType === 'FO' && (
              <InputItem
                clear
                error={this.state.accountError}
                value={this.state.fibosAccount}
                onChange={value => {
                  this.setState({
                    fibosAccount: value,
                  })
                }}
                placeholder={strings('Please input fibos account')}
                onBlur={() => {
                  const { fibosAccount } = this.state
                  if (!/^[a-z1-5.]{5,12}$/.test(fibosAccount)) {
                    this.setState({
                      accountError: true,
                    })
                    Toast.fail(strings('Account format error'))
                  } else {
                    this.checkFibosAccount(fibosAccount)
                  }
                }}>
                To:
              </InputItem>
            )}
            {this.state.crossType === 'OKT' && (
              <InputItem
                clear
                error={this.state.accountError}
                value={this.state.oktAccount}
                onChange={value => {
                  this.setState({
                    oktAccount: value,
                  })
                }}
                placeholder={strings('Please input OKChain account')}>
                To:
              </InputItem>
            )}
            <InputItem
              clear
              type="number"
              value={this.state.crossAmount}
              onChange={value => {
                this.setState({
                  crossAmount: value,
                })
              }}
              extra={
                <Picker
                  title="Cross Token"
                  data={crossTokens.map((item, index) => ({
                    value: index,
                    label: item.symbol,
                  }))}
                  cols={1}
                  value={this.state.crossToken}
                  // onChange={v => {
                  //   this.setState({ crossToken: v })
                  // }}
                  onOk={v => {
                    this.setState({ crossToken: v })
                    // this.props.newAssetTransaction(crossTokens[v])
                  }}>
                  <Flex>
                    <Text>{crossTokens[this.state.crossToken].symbol}</Text>
                    <Icon name="caret-down" />
                  </Flex>
                </Picker>
              }
              placeholder={strings('Please input crosss amount')}
              onBlur={() => {}}>
              Amount:
            </InputItem>
          </List>
          <Button
            type="primary"
            style={{ margin: 20 }}
            onPress={async () => {
              if (this.state.crossType === 'FO') {
                Toast.loading('loading..', 0)
                if (!this.state.isFibosAccountValid) {
                  // register account to eth
                  this.registerApprove()
                } else {
                  const symbol = crossTokens[this.state.crossToken].symbol
                  goBrowser(
                    this.props.navigation,
                    `https://cross.fo/transfer?account=${this.state.fibosAccount}&amount=${this.state.crossAmount}&token=${symbol}`
                  )
                }
              }
            }}>
            {!!this.state.crossInfo ? 'Register' : 'Confirm'}
          </Button>
        </Modal>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F7F7F7', marginBottom: 0 },
  tabView: {
    flex: 1,
    backgroundColor: '#ddd',
  },
})

export default inject(({ store: state }) => ({
  settings: state.settings,
  accountStore: state.accountStore,

  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
  currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
  identities: state.engine.backgroundState.PreferencesController.identities,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
  tokens: state.engine.backgroundState.AssetsController.tokens,
  collectibles: state.engine.backgroundState.AssetsController.collectibles,
  networkType: state.engine.backgroundState.NetworkController.provider.type,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  wizardStep: state.wizard.step,

  resetTransaction: state.transaction.resetTransaction,
  setTransactionObject: state.transaction.setTransactionObject,
  newAssetTransaction: selectedAsset => state.transaction.newAssetTransaction(selectedAsset),
  toggleNetworkModal: state.modals.toggleNetworkModal,
  // showTransactionNotification: args => state.transaction.showTransactionNotification(args),
  // hideTransactionNotification: state.transaction.hideTransactionNotification

  // createNewTab: url => state.browser.createNewTab(url),
  // setActiveTab: id => state.browser.setActiveTab(id),
}))(observer(History))
