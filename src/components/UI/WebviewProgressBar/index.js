import React from 'react';
import { colors } from '../../../styles/common';
import ProgressBar from 'react-native-progress/Bar';
import FadeView from '../FadeView';

const WebviewProgressBar = (props) => {

  const [visible, setVisible] = React.useState(true)
  if (props.progress === 1) {
    setTimeout(() => {
      setVisible(false);
    }, 300);
  } else if (!visible && props.progress !== 1) {
    setVisible(true);
  }

  const show = () => {
    setVisible(true);
  }
  return <FadeView visible={visible}>
    <ProgressBar
      progress={props.progress}
      color={colors.blue}
      width={null}
      height={3}
      borderRadius={0}
      borderWidth={0}
      useNativeDriver
    />
  </FadeView>
}

export default WebviewProgressBar
