import React from "react";
import { StyleSheet, Image, TouchableHighlight, Animated } from "react-native";
import _ from 'lodash'
import { Text, View } from "react-native";
import { Flex } from "@ant-design/react-native";
import { observer, inject } from "mobx-react";
import { computed } from "mobx";
import BigNumber from "bignumber.js";
import { toFixedLocaleString } from "../../../utils/NumberUtil";
import CoinStore from "../../../stores/wallet/CoinStore";

@inject('store')
@observer
class AssetsHeader extends React.Component {
  state = {
    hidden: false,
  };

  @computed get balance() {
    const { coins } = this.props

    const balance = coins.reduce((total, coin) => {
      return total + (_.get(coin, 'others', []).reduce((ban, other) => ban + other.balance, coin.balance) * (CoinStore[`${coin.name}Price`] || 0))
    }, 0);

    const bigNumber = new BigNumber(`${balance}`)
    return bigNumber
  }

  @computed get totalAsset() {
    const { accountStore } = this.props.store;

    if (accountStore.isHiddenPrice) {
      return "*****";
    }
    const totalAsset = toFixedLocaleString(this.balance, 2, true)
    return totalAsset;
    // return accountStore.isHiddenPrice ? "*****" : 
    // toFixedLocaleString(this.props.account ? 
    // this.props.account.totalAsset: 0, 2, true);
  }

  @computed get coinbaseBTC() {
    const { accountStore } = this.props.store;
    if (accountStore.isHiddenPrice) {
      return "*****";
    }
    const amount = toFixedLocaleString(new BigNumber(this.balance).div(CoinStore.BTCPrice || 1), 8);
    return `≈ ${amount} BTC`;
  }

  constructor(props) {
    super(props);
  }

  _onVisualButtonPress = () => {
    const { accountStore } = this.props.store;
    accountStore.setHiddenPrice(!accountStore.isHiddenPrice);
  };
  render() {
    const { accountStore } = this.props.store
    return (
      <Flex justify="around" flexDirection="column">
        <Text style={styles.price}>{!accountStore.isHiddenPrice && CoinStore.currencySymbol} {this.totalAsset}</Text>
        <Flex style={styles.titleWrap}>
          <Text style={styles.title}>{this.coinbaseBTC}</Text>
          <TouchableHighlight
            underlayColor="transparent"
            activeOpacity={0.6}
            onPress={this._onVisualButtonPress}>
            <Image
              tintColor={"#FFFFFF80"}
              source={
                accountStore.isHiddenPrice
                  ? require("../../../images/Wallet/asset_invisual.png")
                  : require("../../../images/Wallet/asset_visual.png")
              }
              resizeMode="contain"
              style={styles.showIcon}
            />
          </TouchableHighlight>
        </Flex>
      </Flex>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  showIcon: {
    marginLeft: 3,
    tintColor: "#FFFFFF80",
    width: 22,
  },
  totalWrap: {
    width: "50%",
  },
  todayWrap: {
    width: "50%",
  },
  titleWrap: {},
  title: {
    marginRight: 5,
    fontSize: 13,
    color: "#C6C8CC",
  },
  price: {
    marginTop: 6,
    fontSize: 15,
    color: "#FFFFFF",
  },
  row: {
    marginTop: 5,
  },
  separator: {
    marginTop: 7,
    marginBottom: 7,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#858892",
  },
});

export default Animated.createAnimatedComponent(AssetsHeader);
