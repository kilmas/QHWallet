import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation } from 'react-navigation';
import { statusBarHeight } from '../utils/device';
import { styles, LGColor, BGGray } from '../theme';
import GlobalNavigation from '../utils/GlobalNavigation';

class TitleBar extends React.PureComponent {
  static defaultProps = {
    renderLeft: () => (
      <TouchableOpacity
        style={styles.center}
        onPress={() => {
          GlobalNavigation.goBack();
        }}>
        <Icon name="left" />
      </TouchableOpacity>
    ),
    renderRight: () => null,
    title: '',
  };

  static propTypes = {
    renderLeft: PropTypes.func,
    renderRight: PropTypes.func,
    title: PropTypes.string,
  };

  render() {
    return (
      <LinearGradient
        colors={LGColor}
        useAngle={true}
        angle={90}
        angleCenter={{ x: 0.5, y: 0 }}
        style={{
          width: '100%',
          backgroundColor: '#fff',
          borderColor: '#E0E0E0',
          overflow: 'hidden',
        }}>
        <Flex justify="center" align="center" style={{ marginTop: statusBarHeight, marginBottom: 8 }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                color: '#fff',
                maxWidth: '65%'
              }}>
              {this.props.title}
            </Text>
          </View>
          <View style={{ position: 'absolute', left: 5, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {this.props.renderLeft()}
          </View>
          <View style={{ position: 'absolute', right: 5, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {this.props.renderRight()}
          </View>
        </Flex>
      </LinearGradient>
    );
  }
}

export default withNavigation(TitleBar);
