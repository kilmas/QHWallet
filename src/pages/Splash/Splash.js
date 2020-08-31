import React from 'react';
import { Image } from 'react-native';
import { when } from "mobx";
import { inject, observer } from 'mobx-react';
import Container from '../../components/Container';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { styles as themeStyles } from '../../theme';
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';
import Engine from '../../modules/metamask/core/Engine';

@inject('store')
@observer
class Splash extends React.Component {

  componentDidMount() {
    // SecureKeychain.resetGenericPassword()
    const { accountStore } = this.props.store
    when(
      () => accountStore.isInit,
      isInit => {
        this.goNext(true, accountStore.currentAccount)
      }
    )
    this.goNext(accountStore.isInit, accountStore.currentAccount)
  }

  goNext = async (isInit, currentAccount) => {
    if (isInit) {
      if (currentAccount) {
        try {
          const credentials = await SecureKeychain.getGenericPassword();
          if (credentials) {
            const { KeyringController } = Engine.context;
            KeyringController.submitPassword(credentials.password);
            GlobalNavigation.reset('TabDrawer');
            return
          } else {
            return
          }
        } catch (error) {
          console.warn(error)
          return
        }
      }
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
