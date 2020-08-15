import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet, InteractionManager } from 'react-native';
import { Badge, Flex, Modal, Icon } from '@ant-design/react-native';
import LinearGradient from 'react-native-linear-gradient';
import { inject, observer } from 'mobx-react';
import GlobalNavigation from '../utils/GlobalNavigation';
import { styles as themeStyles, MainColor, BDCoLor } from '../theme';
import { getIcon } from '../stores/wallet/Coin';
import ReceiveRequest from './UI/ReceiveRequest';
import { strings } from '../locales/i18n';
import { withNavigation } from 'react-navigation';
import NetworkList from './UI/NetworkList';

import Engine from '../modules/metamask/core/Engine'
import { BN } from 'ethereumjs-util'
import contractMap from 'eth-contract-metadata'
import TransactionTypes from '../modules/metamask/core/TransactionTypes';
import { safeToChecksumAddress } from '../utils/address';
import { hexToBN, renderFromTokenMinimalUnit, fromWei } from '../utils/number';
import { APPROVE_FUNCTION_SIGNATURE, decodeTransferData, getMethodData, TOKEN_METHOD_TRANSFER } from '../utils/transactions';
import Networks from '../utils/networks'

const cellStyles = StyleSheet.create({
  cellFlex: {
    ...themeStyles.shadow,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007CFF',
    borderWidth: 0,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 18,
  },
  cellCoin: {
    width: 40,
    height: 40,
    marginLeft: 10,
    marginRight: 20,
  },
  nameView: {
    paddingTop: 20,
    paddingBottom: 20,
    width: 250,
  },
  coinName: {
    fontSize: 14,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    marginBottom: 10,
  },
  coinPrice: {
    fontSize: 14,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    maxWidth: 220,
  },
  coinBalance: {
    fontSize: 12,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'right',
  },
  coinTotal: {
    ...themeStyles.subTitle,
    color: '#49A303',
    textAlign: 'left',
    maxWidth: 110,
  },
  rightView: {
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: 12,
    marginRight: 8,
  }
});

@inject('store')
@observer
class ChainCell extends React.Component {
  state = {}
  render() {
    const { coin, active, onSelect } = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          onSelect && onSelect(coin)
        }}>
        <Flex justify="between" style={cellStyles.cellFlex}>
          <Flex>
            <Image
              source={{ uri: getIcon(coin) }}
              resizeMode="contain"
              style={cellStyles.cellCoin}
            />
            <View style={cellStyles.nameView}>
              <Text style={cellStyles.coinName}>
                {this.props.coin}
              </Text>
              <Text ellipsizeMode={'tail'} style={cellStyles.coinPrice}>
                0
              </Text>
            </View>
          </Flex>
          <View style={cellStyles.rightView}>
            {active === coin ?
              <Icon name="check" size="md" color={BDCoLor} /> : <Icon name="check" size="md" color={"#fff"} />}
          </View>
        </Flex>
      </TouchableOpacity>
    )
  }
}


class Drawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.menus = [{
      img: <Image
        source={require('../images/Tab/bitcoin_wallet_normal.png')}
        resizeMode={'contain'}
        style={{ width: 24, height: 24 }}
      />,
      title: strings('wallet.wallet'),
      onPress: () => {
        GlobalNavigation.toggleDrawer();
        props.settings.setInitialRouteName('Wallet')
        GlobalNavigation.navigate('Wallet');
      }
    }, {
      img: <Image
        source={require('../images/Tab/trade_normal.png')}
        resizeMode={'contain'}
        style={{ width: 24, height: 24 }}
      />,
      title: strings('wallet.Defi'),
      onPress: () => {
        GlobalNavigation.toggleDrawer();
        props.settings.setInitialRouteName('Defi')
        GlobalNavigation.navigate('Defi');
      }
    }, {
      img: <Image
        source={require('../images/Tab/dapp_normal.png')}
        resizeMode={'contain'}
        style={{ width: 24, height: 24 }}
      />,
      title: strings('wallet.dapp'),
      onPress: () => {
        GlobalNavigation.toggleDrawer();
        props.settings.setInitialRouteName('DApp')
        GlobalNavigation.navigate('DApp');
      }
    }, {
      img: <Icon name="project" />,
      title: strings('wallet.management'),
      onPress: () => {
        GlobalNavigation.toggleDrawer();
        GlobalNavigation.navigate('WalletManagement');
      }
    }, {
      img: <Icon name="setting" />,
      title: strings('wallet.settings'),
      onPress: () => {
        GlobalNavigation.toggleDrawer();
        GlobalNavigation.navigate('Settings');
      }
    }];
  }

  componentDidMount() {

    InteractionManager.runAfterInteractions(() => {
      // AppState.addEventListener('change', this.handleAppStateChange)
      // this.lockManager = new LockManager(this.props.navigation, this.props.lockTime)
      // PushNotification.configure({
      //   requestPermissions: false,
      //   onNotification: notification => {
      //     let data = null
      //     if (Device.isAndroid()) {
      //       if (notification.tag) {
      //         data = JSON.parse(notification.tag)
      //       }
      //     } else if (notification.data) {
      //       data = notification.data
      //     }
      //     if (data && data.action === 'tx') {
      //       if (data.id) {
      //         TransactionsNotificationManager.setTransactionToView(data.id)
      //       }
      //       this.props.navigation.navigate('TransactionsHome')
      //     }

      //     // if (Device.isIos()) {
      //     //   notification.finish(PushNotificationIOS.FetchResult.NoData)
      //     // }
      //   },
      // })

      Engine.context.TransactionController.hub.on('unapprovedTransaction', this.onUnapprovedTransaction)

      Engine.context.MessageManager.hub.on('unapprovedMessage', messageParams => {
        const { title: currentPageTitle, url: currentPageUrl } = messageParams.meta
        delete messageParams.meta
        this.setState({
          signMessage: true,
          signMessageParams: messageParams,
          signType: 'eth',
          // currentPageTitle,
          // currentPageUrl,
        })
      })

      Engine.context.PersonalMessageManager.hub.on('unapprovedMessage', messageParams => {
        const { title: currentPageTitle, url: currentPageUrl } = messageParams.meta
        delete messageParams.meta
        this.setState({
          signMessage: true,
          signMessageParams: messageParams,
          signType: 'personal',
          // currentPageTitle,
          // currentPageUrl,
        })
      })

      Engine.context.TypedMessageManager.hub.on('unapprovedMessage', messageParams => {
        const { title: currentPageTitle, url: currentPageUrl } = messageParams.meta
        delete messageParams.meta
        this.setState({
          signMessage: true,
          signMessageParams: messageParams,
          signType: 'typed',
          // currentPageTitle,
          // currentPageUrl,
        })
      })

      setTimeout(() => {
        // TransactionsNotificationManager.init(this.props.navigation, this.props.showTransactionNotification, this.props.hideTransactionNotification)
        // this.pollForIncomingTransactions()

        // this.initializeWalletConnect()

        // Only if enabled under settings
        if (this.props.paymentChannelsEnabled) {
          this.initializePaymentChannels()
        }

        // setTimeout(() => {
        //   this.checkForSai()
        // }, 3500)

        // this.removeConnectionStatusListener = NetInfo.addEventListener(this.connectionChangeHandler)
      }, 1000)
    })
  }

  onUnapprovedTransaction = async transactionMeta => {
    console.log(transactionMeta)
    if (transactionMeta.origin === TransactionTypes.MMM) return
    // Check if it's a payment channel deposit transaction to sign
    const to = safeToChecksumAddress(transactionMeta.transaction.to)
    const networkId = Networks[this.props.providerType].networkId

    const {
      transaction: { value, gas, gasPrice, data },
    } = transactionMeta
    const { AssetsContractController } = Engine.context
    transactionMeta.transaction.gas = hexToBN(gas)
    transactionMeta.transaction.gasPrice = hexToBN(gasPrice)

    if ((value === '0x0' || !value) && data && data !== '0x' && to && (await getMethodData(data)).name === TOKEN_METHOD_TRANSFER) {
      let asset = this.props.tokens.find(({ address }) => address === to)
      if (!asset && contractMap[to]) {
        asset = contractMap[to]
      } else if (!asset) {
        try {
          // address need
          asset = { address: to }
          asset.decimals = await AssetsContractController.getTokenDecimals(to)
          asset.symbol = await AssetsContractController.getAssetSymbol(to)
        } catch (e) {
          // This could fail when requesting a transfer in other network
          asset = { symbol: 'ERC20', decimals: new BN(0) }
        }
      }

      const decodedData = decodeTransferData('transfer', data)
      transactionMeta.transaction.value = hexToBN(decodedData[2])
      transactionMeta.transaction.readableValue = renderFromTokenMinimalUnit(hexToBN(decodedData[2]), asset.decimals)
      transactionMeta.transaction.to = decodedData[0]

      this.props.setTransactionObject({
        type: 'INDIVIDUAL_TOKEN_TRANSACTION',
        selectedAsset: asset,
        id: transactionMeta.id,
        origin: transactionMeta.origin,
        ...transactionMeta.transaction,
      })
    } else {
      transactionMeta.transaction.value = hexToBN(value)
      transactionMeta.transaction.readableValue = fromWei(transactionMeta.transaction.value)

      this.props.setEtherTransaction({
        id: transactionMeta.id,
        origin: transactionMeta.origin,
        ...transactionMeta.transaction,
      })
    }

    if (data && data.substr(0, 10) === APPROVE_FUNCTION_SIGNATURE) {
      this.props.navigation.push('ApproveView')
    } else {
      this.props.navigation.push('ApprovalView')
    }

  }

  menus = []

  _refresh = async () => { }

  toggleReceiveModal = () => {
    if (!this.animatingReceiveModal) {
      this.animatingReceiveModal = true;
      this.props.toggleReceiveModal();
      setTimeout(() => {
        this.animatingReceiveModal = false;
      }, 500);
    }
  };

  onNetworksModalClose = async manualClose => {
    this.toggleNetworksModal();
    if (!manualClose) {
      console.log(manualClose)
    }
  };


  toggleNetworksModal = () => {
    if (!this.animatingNetworksModal) {
      this.animatingNetworksModal = true;
      this.props.toggleNetworkModal();
      setTimeout(() => {
        this.animatingNetworksModal = false;
      }, 500);
    }
  };

  render() {
    return (
      <LinearGradient
        colors={MainColor}
        useAngle={true}
        angle={90}
        angleCenter={{ x: 0.5, y: 0 }}
        style={{
          flex: 1,
          paddingLeft: 30,
        }}>
        <View
          style={{
            flex: 1,
            paddingTop: 100
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
            <TouchableOpacity
              onPress={() => {

              }}>
              <Icon name="user" size={50} />
            </TouchableOpacity>
            <View
              style={{
                marginLeft: 17,
                height: 49,
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ visible: true })
                }}>
                <Text
                  style={{
                    fontSize: 20,
                    color: '#fff',
                    maxWidth: 150,
                  }}>
                  {strings('Select Chain')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setState({ visible: true })
                }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: '#95A1F1',
                    maxWidth: 150,
                    flexWrap: 'wrap',
                  }}>
                  {strings('Select Account')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.menus.map((item, index) => (<TouchableOpacity
            key={index.toString()}
            style={{ marginTop: index === 0 ? 90 : 25 }}
            onPress={item.onPress}>
            <Flex>
              {item.img}
              <Text
                style={{
                  fontSize: 20,
                  color: '#fff',
                  marginLeft: 30,
                }}>
                {item.title}
              </Text>
            </Flex>
          </TouchableOpacity>))
          }
        </View>
        {/* <Modal
          popup
          visible={this.state.visible}
          animationType="slide-up"
          maskClosable
          onClose={() => {
            this.setState({ visible: false })
          }}
        >
          <View style={{ paddingVertical: 20, paddingHorizontal: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
            {['FO', 'ETH', 'BTC'].map((item, index) => <ChainCell coin={item} active={this.state.active} key={index.toString()} onSelect={(name) => {
              this.setState({ active: name })
            }} />)}
          </View>
        </Modal> */}
        <Modal
          // transparent
          closable
          maskClosable
          popup
          animationType="slide-up"
          title={strings('receive_request.title')}
          onClose={this.toggleReceiveModal}
          visible={this.props.receiveModalVisible}
          onBackdropPress={this.toggleReceiveModal}
          onBackButtonPress={this.toggleReceiveModal}
          onSwipeComplete={this.toggleReceiveModal}
          propagateSwipe
        >
          <ReceiveRequest navigation={this.props.navigation} showReceiveModal={this.showReceiveModal} />
        </Modal>
        <Modal
          popup
          animationType="slide-up"
          visible={this.props.networkModalVisible}
          onClose={this.toggleNetworksModal}
          onBackdropPress={this.toggleNetworksModal}
          onBackButtonPress={this.toggleNetworksModal}>
          <NetworkList onClose={this.onNetworksModalClose} />
        </Modal>
      </LinearGradient>
    );
  }
}

export default inject(({ store: state }) => ({
  settings: state.settings,
  receiveModalVisible: state.modals.receiveModalVisible,
  networkModalVisible: state.modals.networkModalVisible,
  accountsModalVisible: state.modals.accountsModalVisible,

  toggleReceiveModal: asset => state.modals.toggleReceiveModal(asset),
  toggleNetworkModal: state.modals.toggleNetworkModal,

  lockTime: state.settings.lockTime,
  tokens: state.engine.backgroundState.AssetsController.tokens,
  paymentChannelsEnabled: state.settings.paymentChannelsEnabled,
  providerType: state.engine.backgroundState.NetworkController.provider.type,

  setEtherTransaction: transaction => state.transaction.setEtherTransaction(transaction),
  setTransactionObject: transaction => state.transaction.setTransactionObject(transaction),
  showTransactionNotification: args => state.transaction.showTransactionNotification(args),
  hideTransactionNotification: state.transaction.hideTransactionNotification,

}))(observer(withNavigation(Drawer)))

