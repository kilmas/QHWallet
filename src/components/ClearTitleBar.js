import PropTypes from 'prop-types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Flex, Icon } from '@ant-design/react-native';
import { withNavigation } from 'react-navigation';
import { styles } from '../theme';
import GlobalNavigation from '../utils/GlobalNavigation';

class ClearTitleBar extends React.PureComponent {
  static defaultProps = {
    renderLeft: () => (
      <TouchableOpacity
        style={{
          paddingHorizontal: 18,
          ...styles.center,
        }}
        onPress={() => {
          GlobalNavigation.goBack();
        }}>
        <Icon name="left" />
      </TouchableOpacity>
    ),
    renderRight: () => null,
    title: 'Miss a title',
    type: '',
  };

  static propTypes = {
    type: PropTypes.string,
    renderLeft: PropTypes.func,
    renderRight: PropTypes.func,
    title: PropTypes.string,
  };

  render() {
    return (
      <Flex style={{ height: 90, width: '100%' }} justify="center">
        <View style={{ flex: 1, alignItems: 'center', }}>
          <Text
            style={{
              fontSize: 19,
              color: '#FFF',
            }}>
            {this.props.title}
          </Text>
        </View>
        <View style={{ position: 'absolute', left: 0, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {this.props.renderLeft()}
        </View>
        <View style={{ position: 'absolute', right: 0, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {this.props.renderRight()}
        </View>
      </Flex>
    );
  }
}

export default withNavigation(ClearTitleBar);
