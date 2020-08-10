import React from 'react';
import { Animated } from 'react-native';

const FadeView1 = ({ style, children, ...rest }) => {

  const [visible, setVisible] = React.useState(rest.visible)
  const [visibility] = React.useState(new Animated.Value(rest.visible ? 1 : 0))

  React.useEffect(()=>{
    Animated.timing(visibility, {
      toValue: rest.visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      isInteraction: false
    }).start(() => {
      setTimeout(() => {
        setVisible(rest.visible);
      }, 500);
    });
  }, [visibility, rest.visible])
  const containerStyle = {
    opacity: visibility.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })
  };

  const combinedStyle = [containerStyle, style];
  return (
    <Animated.View style={visible ? combinedStyle : containerStyle} {...rest}>
      {visible && children}
    </Animated.View>
  );
}


export default FadeView1;