import React from 'react';
import { Text, TextInput, View } from 'react-native';
import _ from 'lodash'
import { Button, Modal, Toast } from '@ant-design/react-native';
import { inject, observer } from 'mobx-react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../components/Container';
import { styles as themeStyles, BGGray } from '../../theme';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import GlobalNavigation from '../../utils/GlobalNavigation';
import HDAccount from '../../stores/account/HDAccount';
import setKeyChain from '../../utils/keychain';

@inject('store')
@observer
class NameWallet extends React.Component {

  constructor (props) {
    super(props);
    this.handleClickThrottled = _.throttle(this._createImport, 5000);
    this.state = {
      name: '',
      password: '',
      mode: props.navigation.getParam('mode')
    };
  }

  _createImport = async () => {
    const {
      name,
      password,
      mode,
    } = this.state;

    if (mode === 'create') {
      try {
        await window.showLoading(true);
        const { account, mnemonics } = await HDAccount.create(name, password);
        const keychain = await setKeyChain(name, password);
        if (!keychain) {
          return
        }
        this.props.store.engine.importMetamask(password, mnemonics);
        this.props.store.accountStore.insert(account)
        GlobalNavigation.reset('CreateWalletSuccess', {
          mnemonics: mnemonics.split(' '),
          name,
          password,
        });
      } catch (e) {
        console.warn(e)
        Toast.info(strings('Create failed'));
      } finally {
        window.hideLoading();
      }
    } else {
      GlobalNavigation.navigate('InputPhrases', {
        name,
        password,
      });
    }
  }

  setPassword = () => {
    Modal.prompt(
      'Set Transaction Password',
      'Only save password in mobile local!',
      password1 => {
        if (password1 === '') {
          Toast.info(strings('password is empty!'));
          return
        }
        Modal.prompt(
          'Please Confirm your transation password',
          'Save it carefully!',
          password2 => {
            if (password1 === password2) {
              this.setState({password: password1}, this.handleClickThrottled)
            } else {
              Toast.info(strings('password incorret'));
            }
          },
          'secure-text',
          ''
        );
      },
      'secure-text',
      ''
    );
  }

  render() {
    const { mode } = this.state
    return (
      <Container>
        <TitleBar title={strings(`wallet.${mode}`)} />
        <KeyboardAwareScrollView contentContainerStyle={themeStyles.pt26}>
          <Text style={{ fontSize: 18 }}>{strings('Name your wallet')}</Text>
          <TextInput
            style={{
              fontSize: 16,
              color: '#000000',
              backgroundColor: BGGray,
              borderRadius: 10,
              marginTop: 25,
              height: 50,
              marginBottom: 50,
              paddingHorizontal: 13,
            }}
            onChangeText={name => this.setState({ name })}
            numberOfLines={1}
            maxLength={15}
            placeholder={strings('wallet.nameWallet')}
          />
          <Button
            type="primary"
            onPress={() => {
              if (this.state.name === '') {
                return;
              }
              if (mode === 'import') {
                const { accountStore: { defaultHDAccount }  } = this.props.store
                if (defaultHDAccount && defaultHDAccount.hasCreated) {
                  GlobalNavigation.navigate('ImportMethod', {
                    name: this.state.name,
                    mode,
                  });
                  return
                }
                this.setPassword()
              } else if (mode === 'create') {
                this.setPassword()
              }
            }}
          >{strings('next')}</Button>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

export default NameWallet