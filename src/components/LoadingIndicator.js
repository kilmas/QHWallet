import React, { PureComponent } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { deviceHeight } from '../utils/device'
import { styles } from '../theme'

export default class LoadingIndicator extends PureComponent {
  static propTypes = {}

  static defaultProps = {}

  state = {
    isShowLoading: false,
    mask: true,
  }
  showLoading = async mask => {
    //默认显示遮罩层mask
    let showMask = mask === undefined || mask === true

    if (this.state.isShowLoading === false) {
      this.setState(
        {
          mask: showMask,
          isShowLoading: true,
        },
        () => {
          return null
        }
      )
    } else {
      return null
    }
  }
  hideLoading = async () => {
    if (this.state.isShowLoading === true) {
      this.setState(
        {
          isShowLoading: false,
        },
        () => {
          return null
        }
      )
    } else {
      return null
    }
  }

  render() {
    if (this.state.isShowLoading === false) {
      return null
    }

    return (
      <View
        style={
          this.state.mask
            ? [StyleSheet.absoluteFill, styles.center, { backgroundColor: 'rgba(0,0,0,0.5)' }]
            : [
                {
                  position: 'absolute',
                  left: (750 - 170) / 4,
                  top: (deviceHeight - 85) / 2,
                },
              ]
        }>
        <View
          style={{
            ...styles.center,
            borderRadius: 5,
            width: 85,
            height: 85,
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}>
          <ActivityIndicator size={'large'} color={'white'} />
          <Text
            style={{
              fontSize: 13,
              marginTop: 5,
              color: 'white',
              fontWeight: '500',
            }}>
            Loading...
          </Text>
        </View>
      </View>
    )
  }
}
