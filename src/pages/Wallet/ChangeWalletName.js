import React from 'react';
import { TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { inject, observer } from 'mobx-react';
import { Button } from '@ant-design/react-native';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { styles as themeStyles } from '../../theme';
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';

@inject('store')
@observer
class ChangeWalletName extends React.Component {
  state = {
    name: '',
    newName: '',
    keychainObject: {}
  };

  async componentDidMount() {
    const keychainObject = await SecureKeychain.getGenericPassword()
    this.setState({ keychainObject })
  }

  render() {
    return (
      <Container style={{ backgroundColor: '#FFF' }}>
        <TitleBar
          title={strings('wallet.changeWalletName')}
        />
        <KeyboardAwareScrollView contentContainerStyle={themeStyles.pt26}>
          <View
            style={{
              marginBottom: 50,
              backgroundColor: '#F7F8F9',
              paddingHorizontal: 26,
              paddingTop: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E4E4E4',
            }}>
            <TextInput
              style={{
                paddingHorizontal: 26,
              }}
              onChangeText={text => this.setState({ newName: text })}
              placeholder={this.state.keychainObject.username}
              placeholderTextColor={'#999EA4'}
            />
          </View>
          <Button
            type="primary"
            onPress={async () => {
              if (this.props.navigation.state.params.type === 'current') { }
              GlobalNavigation.goBack();
              this.props.navigation.state.params.refresh();
            }}
          >{strings('confirm')}</Button>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

export default ChangeWalletName;
