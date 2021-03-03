import React from 'react';
import { Text, TextInput } from 'react-native';
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
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';

@inject('store')
@observer
class NameWallet extends React.Component {

  constructor(props) {
    super(props);
    this.handleClickThrottled = _.throttle(this._createImport, 5000);
    this.state = {
      name: '',
      password: '',
      mode: props.navigation.getParam('mode'),
      loading: false,
    };
  }

  _createImport = async () => {
    const {
      name,
      password,
      mode,
    } = this.state;

    if (mode === 'create') {
      this.setState({ loading: true })
      try {
        const { account, mnemonics } = await HDAccount.create(name, password);
        const keychain = await setKeyChain(name, password);
        if (!keychain) {
          return
        }
        this.props.store.engine.importMetamask(mnemonics, password);
        this.props.store.accountStore.insert(account)
        this.setState({ loading: false })
        GlobalNavigation.reset('CreateWalletSuccess', {
          mnemonics: mnemonics.split(' '),
          name,
          password,
        });
      } catch (e) {
        console.warn(e)
        Toast.info(strings('Create failed'));
      }
    } else {
      GlobalNavigation.navigate('InputPhrases', {
        name,
        password,
      });
    }
  }

  getPassword = async () => {
    const keychain = await SecureKeychain.getGenericPassword()
    if (keychain && keychain.password) {
      this.setState({ password: keychain.password }, this.handleClickThrottled)
    } else {
      this.setPassword()
    }
  }

  setPassword = () => {
    Modal.prompt(
      'Set Transaction Password',
      'Only save password in mobile locally!',
      password1 => {
        if (password1 === '') {
          Toast.info(strings('password is empty!'));
          return
        }
        Modal.prompt(
          'Please Confirm your transaction password',
          'Save it carefully!',
          password2 => {
            if (password1 === password2) {
              this.setState({ password: password1 }, this.handleClickThrottled)
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
            loading={this.state.loading}
            disabled={this.state.loading}
            onPress={() => {
              if (this.state.name === '') {
                return;
              }
              if (mode === 'import') {
                const { accountStore: { defaultHDAccount } } = this.props.store
                if (defaultHDAccount && defaultHDAccount.hasCreated) {
                  GlobalNavigation.navigate('ImportMethod', {
                    name: this.state.name,
                    mode,
                  });
                  return
                }
                this.setPassword()
              } else if (mode === 'create') {
                this.getPassword()
              }
            }}
          >{strings('next')}</Button>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

export default NameWallet