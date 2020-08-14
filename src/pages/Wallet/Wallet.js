import React from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
  StyleSheet,
} from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';
import _ from 'lodash'
import BigNumber from "bignumber.js";
import { observable, computed } from "mobx";
import { inject, observer, Observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import { toPriceString, toFixedLocaleString } from "../../utils/NumberUtil";
import { BTCCoin, ETH } from '../../stores/wallet/Coin';
import { styles as themeStyles, MainColor } from '../../theme';
import GlobalNavigation from '../../utils/GlobalNavigation';
import Container from '../../components/Container';
import FlatListLoadMoreView from "../../components/FlatListLoadMoreView";
import DrawerIcon from '../../components/DrawerIcon';
import CoinStore from '../../stores/wallet/CoinStore';
import AssetsHeader from './components/AssetsHeader'
import TitleBar from '../../components/TitleBar';

const cellStyles = StyleSheet.create({
  cellFlex: {
    ...themeStyles.shadow,
    width: 329,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 0.5,
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
    marginRight: 10,
  },
  nameView: {
    paddingTop: 10,
    paddingBottom: 10,
    width: 125,
  },
  coinName: {
    fontSize: 14,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    marginBottom: 5,
  },
  coinPrice: {
    fontSize: 14,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    maxWidth: 110,
  },
  coinBalance: {
    fontSize: 12,
    color: '#3D3D3D',
    flex: 1,
    fontWeight: '500',
    marginBottom: 5,
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
    height: 60,
    paddingTop: 10,
    paddingBottom: 12,
    marginRight: 8,
  }
});

@inject('store')
@observer
class CoinCell extends React.Component {
  @computed get balance() {
    const { store: { accountStore }, coin  } = this.props
    if (accountStore.isHiddenPrice) {
      return "*****";
    }

    let balance = 0
    if (coin.name === 'OKT') {
      const { OKTAccounts } = accountStore
      // todo
      OKTAccounts.forEach(account => {
        balance += _.get(account, 'OKTWallet.OKT.balance', 0)
      });
    } else {
      balance = coin.balance
    }
    const bigNumber = new BigNumber(`${balance}`);
    if (bigNumber.isLessThan(0)) {
      return "-";
    }
    return toFixedLocaleString(
      bigNumber,
      coin instanceof BTCCoin || coin instanceof ETH ? 8 : 4,
      true
    );
  }

  @computed get totalPrice() {
    if (this.props.store.accountStore.isHiddenPrice) {
      return "*****";
    }
    if (this.balance == "-") {
      return "-";
    }
    return `≈${toPriceString(this.props.coin.totalPrice, 2, 4, true)}  ${CoinStore.currency}`;
  }
  render() {
    const { coin, account } = this.props;
    return (
      <TouchableOpacity
        onPress={() =>
          GlobalNavigation.navigate('History', {
            coin: coin,
            coinID: coin.id,
            accountID: account.id,
          })
        }>
        <Flex justify="between" style={cellStyles.cellFlex}>
          <Flex>
            <Image
              source={{ uri: coin.icon }}
              resizeMode="contain"
              style={cellStyles.cellCoin}
            />
            <View style={cellStyles.nameView}>
              <Text style={cellStyles.coinName}>
                {this.props.coin.name}
              </Text>
              <Text ellipsizeMode={'tail'} style={cellStyles.coinPrice}>
                {toPriceString(this.props.coin.price, 2, 4, true)} {CoinStore.currency}
              </Text>
            </View>
          </Flex>
          <View style={cellStyles.rightView}>
            <Text style={cellStyles.coinBalance}>
              {this.balance}
            </Text>
            <Text ellipsizeMode={'tail'} style={cellStyles.coinTotal}>
              {this.totalPrice}
            </Text>
          </View>
        </Flex>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  touchAction: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
  },
  coinList: {
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    marginBottom: 50
  },
  flat: {
    marginTop: 10,
  },
  flatContent: {
    alignItems: 'center',
  },
  loadMore: {
    backgroundColor: "transparent",
  },
});

@inject('store')
@observer
class Wallet extends React.Component {
  state = {
    name: '',
    showSavingComing: false,
    showBorrowComing: false,
  };

  @observable isRefreshing = false;

  @computed get account() {
    const { accountStore } = this.props.store
    return accountStore.currentAccount;
    // return accountStore.defaultHDAccount;
  }

  @computed get username() {
    const { accountStore } = this.props.store
    return accountStore.credentials && accountStore.credentials.username;
  }

  @computed get coins() {
    if (this.account && this.account.displayChange) {
      return this.account.coins;
    }
    return this.account.coins.filter(coin => coin && (coin.totalPrice >= 100 || coin.balance >= 100));
  }

  _onRefresh = async () => {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    try {
      // await this.account.update();
    } catch (error) { }

    setTimeout(() => {
      this.isRefreshing = false;
    }, 100);
  };

  _renderItem = ({ item }) => (
    <Observer>{() => <CoinCell coin={item} account={this.account} />}</Observer>
  );

  render() {
    return (
      <Container style={{ backgroundColor: '#f7f7f7' }}>
        <LinearGradient
          colors={MainColor}
          useAngle={true}
          angle={90}
          angleCenter={{ x: 0.5, y: 0 }}
          style={{
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            height: 230,
          }}>
          <TitleBar
            title={this.username}
            renderLeft={() => (
              <DrawerIcon dot={this.props.store.common.newVersion} />
            )}
            renderRight={() => (
              <TouchableOpacity style={{ marginRight: 20 }} onPress={() => {}}><Icon name="ellipsis" /></TouchableOpacity>
            )}
          />
          <AssetsHeader account={this.account} />
        </LinearGradient>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={this.isRefreshing}
              onRefresh={this._onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          data={this.coins}
          keyExtractor={(item, index) => index.toString()}
          style={styles.flat}
          contentContainerStyle={styles.flatContent}
          renderItem={this._renderItem}
          ListFooterComponent={<FlatListLoadMoreView status={"nomore"} style={styles.loadMore} />}
        />
      </Container>
    );
  }
}

export default Wallet;
