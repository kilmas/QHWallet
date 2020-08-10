import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { Toast, WingBlank, Button, Icon } from '@ant-design/react-native';
import TitleBar from '../../components/TitleBar';
import { strings } from '../../locales/i18n';
import Container from '../../components/Container';
import { inject, observer } from 'mobx-react';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { BGGray } from '../../theme';

export default
@inject('store')
@observer
class AddContacts extends React.Component {
  state = {
    name: '',
    address: ''
  };
  _refresh(address) {
    console.log(address);
    this.setState({ address: address });
  }

  render() {
    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar
          title={strings('settings.addContacts')}
          blueBottom={true}
          renderRight={() => (
            <TouchableOpacity
              onPress={() => GlobalNavigation.navigate('ScanQRCode', {
                onSave: address => {
                  this._refresh(address);
                },
              })}>
              <Icon name="scan"/>
            </TouchableOpacity>
          )}
        />

        <WingBlank>
          <TextInput
            placeholder={strings('settings.name')}
            onChangeText={name => this.setState({ name: name })}
          />

          <TextInput
            numberOfLines={2}
            placeholder={strings('settings.address')}
            value={this.state.address}
            onChangeText={address => this.setState({ address: address })}
          />

          <Button
            type="primary"
            onPress={() => {
              if (this.state.name.length === 0) {
                Toast.info("Please input name");
              } else if (this.state.address.length === 0) {
                Toast.info("Please input correct address");
              } else {
                this.props.store.settings.addContacts({
                  name: this.state.name,
                  address: this.state.address,
                });
                GlobalNavigation.goBack();
              }
            }}
          >
            {strings('save')}
          </Button>
        </WingBlank>
      </Container>
    );
  }
}
