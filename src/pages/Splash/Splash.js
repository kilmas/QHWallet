import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
// import { inject, observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import Container from '../../components/Container';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { NETWORK_ENV_MAINNET } from '../../config/const';
import { styles as themeStyles } from '../../theme';
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';
import Engine from '../../modules/metamask/core/Engine';

// @inject('store')
// @observer
class Splash extends React.Component {
  async componentDidMount() {
    const credentials = await SecureKeychain.getGenericPassword();
    if (credentials) {
      const { KeyringController } = Engine.context;
      await KeyringController.submitPassword(credentials.password);
      GlobalNavigation.reset('TabDrawer');
    } else {
      GlobalNavigation.reset('Welcome');
    }
  }

  render() {
    return (
      <Container style={themeStyles.center}>
        <Image
          source={require('../../images/starting.png')}
          resizeMode="contain"
        />
      </Container >
    );
  }
}


export default Splash;
