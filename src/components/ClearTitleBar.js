import PropTypes from 'prop-types'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Flex, Icon } from '@ant-design/react-native'
import { withNavigation } from 'react-navigation'
import { styles } from '../theme'
import GlobalNavigation from '../utils/GlobalNavigation'
import { statusBarHeight } from '../utils/device'

class ClearTitleBar extends React.PureComponent {
  static defaultProps = {
    renderLeft: () => (
      <TouchableOpacity
        style={{
          paddingHorizontal: 18,
          ...styles.center,
        }}
        onPress={() => {
          GlobalNavigation.goBack()
        }}>
        <Icon name="left" />
      </TouchableOpacity>
    ),
    renderRight: () => null,
    title: 'Miss a title',
    type: '',
  }

  static propTypes = {
    type: PropTypes.string,
    renderLeft: PropTypes.func,
    renderRight: PropTypes.func,
    title: PropTypes.string,
  }

  render() {
    return (
      <Flex style={{ height: 50, width: '100%', marginTop: statusBarHeight }} align="start">
        <View style={{ flex: 1, alignItems: 'center', height: '100%', justifyContent: 'center' }}>
          <Text
            style={{
              fontSize: 18,
              color: '#FFF',
              maxWidth: '65%',
            }}>
            {this.props.title}
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 5, height: '100%', alignItems: 'center', justifyContent: 'center' }}>{this.props.renderLeft()}</View>
        <View style={{ position: 'absolute', right: 5, height: '100%', alignItems: 'center', justifyContent: 'center' }}>{this.props.renderRight()}</View>
      </Flex>
    )
  }
}

export default withNavigation(ClearTitleBar)
