import React from 'react';
import {
  Image,
} from 'react-native';
import CoinStore from '../stores/wallet/CoinStore';
import { FO_ICON } from '../stores/wallet/Coin';
import { OKT_ICON } from '../stores/wallet/Coin';
import { Icon } from '@ant-design/react-native';

export default class CoinImage extends React.Component {
  render() {
    const { coin, icon } = this.props;
    switch (coin) {
      case 'BTC':
        return icon && <Image
          source={{ uri: icon }}
          style={{ width: 65, height: 65 }}
        />;
      case 'USDT':
        return icon && (
          <Image
            source={{ uri: icon }}
            style={{ width: 65, height: 65 }}
          />
        );
      case 'ETH':
        return icon && (
          <Image
            source={{ uri: icon }}
            style={{ width: 65, height: 65 }}
          />
        );

      case 'FO':
        return icon && <Image
          resizeMode="contain"
          source={{ uri: FO_ICON }}
          style={{ width: 65, height: 65 }}
        />;
      case 'OKT':
          return icon && <Image
            resizeMode="contain"
            source={{ uri: OKT_ICON }}
            style={{ width: 65, height: 65 }}
          />;

      default:
        return <Icon name="money-collect" size={50}/>;
    }
  }
}
