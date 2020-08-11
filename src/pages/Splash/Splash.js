import React from 'react';
import { Image } from 'react-native';
import { reaction } from "mobx";
import { inject, observer } from 'mobx-react';
import Container from '../../components/Container';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { styles as themeStyles } from '../../theme';
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';
import Engine from '../../modules/metamask/core/Engine';

@inject('store')
@observer
class Splash extends React.Component {
  async componentDidMount() {
    const credentials = await SecureKeychain.getGenericPassword();
    // SecureKeychain.resetGenericPassword()
    reaction(
      () => this.props.store.accountStore.isInit,
      isInit => {
        if (isInit) {
          if (credentials && this.props.store.accountStore.HDAccounts.length) {
            const { KeyringController } = Engine.context;
            KeyringController.submitPassword(credentials.password);
            GlobalNavigation.reset('TabDrawer');
          } else {
            GlobalNavigation.reset('Welcome');
          }
        }
      }
    );
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
