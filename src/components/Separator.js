import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Flex } from '@ant-design/react-native';

class Separator extends React.PureComponent {
  static defaultProps = {
    style: {},
  };

  static propTypes = {
    style: PropTypes.object,
  };

  render() {
    return (
      <Flex justify="center">
        <View
          style={{
            flex: 1,
            height: StyleSheet.hairlineWidth,
            backgroundColor: '#000000',
            opacity: 0.15,
            ...this.props.style,
          }}
        />
      </Flex>
    );
  }
}

export default Separator;
