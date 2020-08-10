import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Device from '../../../../utils/devices';
import { colors, fontStyles } from '../../../../styles/common';

const styles = StyleSheet.create({
  tabIcon: {
    borderWidth: 2,
    borderColor: colors.grey500,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabCount: {
    color: colors.grey500,
    flex: 0,
    lineHeight: Device.isAndroid() ? 3 : 15,
    fontSize: Device.isAndroid() ? 3 : 15,
    textAlign: 'center',
    alignSelf: 'center',
    ...fontStyles.normal
  }
});

/**
 * React.Component that renders an icon showing
 * the current number of open tabs
 */
class TabCountIcon extends React.Component {
  static propTypes = {
		/**
		 * Switches to a specific tab
		 */
    tabCount: PropTypes.number,
		/**
		 * Component styles
		 */
    style: PropTypes.any
  };

  render() {
    const { tabCount, style } = this.props;

    return (
      <View style={[styles.tabIcon, style]}>
        <Text styles={styles.tabCount}>{tabCount}</Text>
      </View>
    );
  }
}


export default inject(({ store: state }) => ({
  tabCount: state.browser.tabs.length
}))(observer(TabCountIcon))
