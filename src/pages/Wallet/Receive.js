import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { observable, computed } from "mobx";
import { inject, observer, Observer } from "mobx-react";
import { Flex, Icon } from '@ant-design/react-native';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { Toast } from '@ant-design/react-native';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import { styles as themeStyles, BGGray } from '../../theme';
import CoinHeader from '../../components/CoinHeader';
import HDAccount from '../../stores/account/HDAccount';
import { HDACCOUNT_FIND_WALELT_TYPE_COINID } from '../../config/const';
import { BTCCoin, FO } from '../../stores/wallet/Coin';
import CommonAccount from '../../stores/account/CommonAccount';
import MultiSigAccount from '../../stores/account/MultiSigAccount';


class Receive extends React.Component {

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

  @observable amount = -1;
  @observable reason = "";
  @observable selectedCoinID = this.props.navigation.state.params.coinID !== undefined ? this.props.navigation.state.params.coinID : this.wallet.defaultCoin.id;

  @computed get wallet() {
    const walletID = this.props.navigation.getParam('walletID')

    let wallet
    if (this.account instanceof HDAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID);
    } else if (this.account instanceof CommonAccount) {
      wallet = this.account.findWallet(this.coin.id, HDACCOUNT_FIND_WALELT_TYPE_COINID);
    } else if (this.account instanceof MultiSigAccount) {
      return this.account.findWallet(walletID);
    }
    return wallet
  }

  @computed get coin() {
    let coin
    if (this.account instanceof HDAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0];
    } else if (this.account instanceof CommonAccount) {
      coin = this.account.findCoin(this.selectedCoinID) || this.account.coins[0];
    } else if (this.account instanceof MultiSigAccount) {
      return this.wallet.findCoin(this.selectedCoinID);
    }
    return coin
  }

  @computed get address() {
    if (this.coin.name === 'BTC') {
      return this.wallet.currentAddress ? this.wallet.currentAddress.address : this.wallet.address;
    } else if(this.coin.name === 'FO') {
      return this.wallet.name || this.account.name;
    }
    return this.wallet && this.wallet.address;
  }

  get sheetOptions() {
    return [
      strings("wallet-title-address"),
      strings("wallet-receive-sheet-new-normal"),
      strings("common-cancel"),
    ];
  }

  handleSelectorRef = ref => (this.selector = ref);

  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
    this.unreaction && this.unreaction();
  }
  async componentDidMount() { }

  render() {
    const { coin, onSave } = this.props.navigation.state.params;
    const btcPrice = 10
    return (
      <Container>
        <CoinHeader
          coin={coin}
          title={`${strings('wallet.receive')} ${coin.name}`}
          onLeftPress={() => {
            GlobalNavigation.goBack();
            onSave && onSave();
          }}
        />
        <KeyboardAwareScrollView
          scrollEnabled={true}
          contentContainerStyle={styles.content}>
          <Flex justify="center" style={styles.QRCode}>
            <QRCode
              value={this.address}
              size={256}
              backgroundColor={BGGray}
              logoBackgroundColor="transparent"
            />
          </Flex>
          <View style={styles.addressView}>
            <Text style={styles.addressTitle}>
              {strings( `Your ${coin.name} address`)}
            </Text>
          </View>
          <Flex justify="between" style={styles.addressFlex}>
            <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.addressText}>
              {this.address}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(this.address);
                Toast.info(strings('Copied!'));
              }}>
              <Icon
                name="copy"
              />
            </TouchableOpacity>
          </Flex>
        </KeyboardAwareScrollView>
      </Container>
    );
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
  }
});


export default inject(({ store: state }) => ({
  settings: state.settings,
  accountStore: state.accountStore,
}))(observer(Receive))
