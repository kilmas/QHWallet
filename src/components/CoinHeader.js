import React from 'react';
import { Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';
import LinearGradient from 'react-native-linear-gradient';
import BigNumber from 'bignumber.js';
import { inject, observer } from 'mobx-react'
import { computed } from "mobx";
import CoinImage from './CoinImage';
import ClearTitleBar from './ClearTitleBar';
import { BTCCoin, ETH } from '../stores/wallet/Coin';
import { toFixedLocaleString, toFixedNumber, toPriceString } from '../utils/NumberUtil';
import CoinStore from '../stores/wallet/CoinStore';
import { strings } from '../locales/i18n'
import { styles as themeStyles } from '../theme'


const bgCoin = index => ({
  BTC: ['#FFCE6F', '#CD8B0C'],
  USDT: ['#9FE1CE', '#53AE94'],
  ETH: ['#7f86a3', '#60688c'],
  FO: ['#99dfff', '#33bfff'],
  OKT: ['#5894f4', '#205fec'],
  EOS: ['#fff', '#0b102d'],
}[index] || ['#22425F', '#070707'])

@inject('store')
@observer
class CoinHeader extends React.Component {

  @computed get showBalance() {
    const { accountStore } = this.props.store
    if (accountStore.isHiddenPrice) {
      return "*****";
    }

    const bigNumber = new BigNumber(this.props.coin.balance + "");
    if (bigNumber.isLessThan(0)) {
      return "-";
    }

    return toFixedLocaleString(
      this.props.coin.balance,
      this.props.coin instanceof BTCCoin || this.props.coin instanceof ETH ? 8 : 4,
      true
    );
  }

  @computed get balance() {
    return this.props.coin.balance
  }

  @computed get price() {
    const { coin } = this.props
    return (CoinStore[`${coin.name}Price`] || 0)
  }

  @computed get totalPrice() {
    const { isHiddenPrice } = this.props
    if (isHiddenPrice) {
      return "*****";
    }
    if (this.balance === "-") {
      return "-";
    }
    const balance = new BigNumber(`${this.balance}`);
    if (balance.isLessThan(0)) {
      return 0;
    }
    const totalPrice = toFixedNumber(balance.multipliedBy(`${this.price}`), 2);
    return `≈ ${CoinStore.currencySymbol} ${toPriceString(totalPrice, 2, 4, true)}`;
  }


  // @computed get totalAsset() {
  //   const { accountStore } = this.props.store
  //   if (accountStore.isHiddenPrice) {
  //     return "*****";
  //   }

  //   if (this.balance == "-") {
  //     return "-";
  //   }
  //   return `≈${toFixedLocaleString(this.props.coin.totalPrice, 2, true)} ${CoinStore.currencySymbol}`;
  // }

  // @computed get floatingAsset() {
  //   const { accountStore } = this.props.store
  //   if (accountStore.isHiddenPrice) {
  //     return "*****";
  //   }

  //   const price = toFixedLocaleString(Math.abs(this.props.coin.floatingTotalPrice), 2, true);
  //   if (this.props.coin.floatingTotalPrice > 0) {
  //     return `+${price}`;
  //   } else if (this.props.coin.floatingTotalPrice < 0) {
  //     return `-${price}`;
  //   } else {
  //     return price;
  //   }
  // }

  @computed get hasAvailable() {
    return this.props.coin.hasOwnProperty("available");
  }

  @computed get available() {
    const { accountStore } = this.props.store
    if (accountStore.isHiddenPrice) {
      return "*****";
    }
    return this.propss.coin.available;
  }

  render() {
    const {
      title,
      onLeftPress,
      renderRight = () => null,
      coin
    } = this.props;
    return (
      <LinearGradient
        colors={bgCoin(coin.name)}
        useAngle={true}
        angle={90}
        angleCenter={{ x: 0.5, y: 0 }}
        style={styles.lineGrad}>
        <ClearTitleBar
          title={title}
          type={coin.name}
          renderLeft={() => (
            <TouchableOpacity
              onPress={onLeftPress}
              style={{ alignItems: 'center', ...themeStyles.p8 }}>
              <Icon
                name="left"
              />
            </TouchableOpacity>
          )}
          renderRight={renderRight}
        />
        <Image source={require('../images/Wallet/history_chart.png')} style={styles.hisChart} />
        <Flex justify="between" style={styles.hisBalance}>
          <CoinImage coin={coin.name} icon={coin.icon} />
          <Flex direction="column" justify="around" align="end">
            <Text style={styles.balanceText}>
              {strings('balance')}
            </Text>
            <Text style={styles.numText}>
              {this.showBalance}
            </Text>
            <Text style={styles.numText}>
              {this.totalPrice}
            </Text>
          </Flex>
        </Flex>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  lineGrad: {
    height: 200,
  },
  hisChart: {
    position: 'absolute',
    height: 100,
    bottom: 0,
  },
  hisBalance: {
    paddingHorizontal: 25,
  },
  balanceText: {
    color: '#FFF',
    fontSize: 18,
  },
  numText: {
    color: '#FFF',
    fontSize: 15,
  }
});

export default CoinHeader;