import React from 'react'
import { Image, StyleSheet } from 'react-native'
import { Icon } from '@ant-design/react-native'

export default class CoinImage extends React.Component {
  render() {
    const { coin, icon } = this.props
    switch (coin) {
      case 'BTC':
        return icon && <Image source={{ uri: icon }} style={styles.icon} />
      case 'USDT':
        return icon && <Image source={{ uri: icon }} style={styles.icon} />
      case 'ETH':
        return icon && <Image source={{ uri: icon }} style={styles.icon} />
      case 'FO':
        return icon && <Image resizeMode="contain" source={{ uri: icon }} style={styles.icon} />
      case 'EOS':
        return icon && <Image resizeMode="contain" source={{ uri: icon }} style={styles.icon} />
      case 'OKT':
        return icon && <Image resizeMode="contain" source={{ uri: icon }} style={styles.icon} />
      case 'TRX':
        return icon && <Image resizeMode="contain" source={{ uri: icon }} style={styles.icon} />
        
      default:
        return <Icon name="money-collect" size={50} />
    }
  }
}

const styles = StyleSheet.create({
  icon: { width: 65, height: 65 },
})
