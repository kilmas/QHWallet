import React from 'react';
import { View } from 'react-native';

function Container(props) {
  return (
    <View
      style={{
        flex: 1,
        marginBottom: 0,
        backgroundColor: '#fff',
        ...props.style,
      }}>
      {props.children}
    </View>
  );
}

export default Container;
