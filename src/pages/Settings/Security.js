import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Radio, Switch, Flex } from '@ant-design/react-native';
import { inject, observer } from 'mobx-react';
import i18n from 'react-native-i18n';
import AsyncStorage from '@react-native-community/async-storage';
import TitleBar from '../../components/TitleBar';
import { strings } from '../../locales/i18n';
import Container from '../../components/Container';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { SecondaryColor, BDCoLor, BGGray } from '../../theme';
import Device from '../../utils/devices';
import SecureKeychain from '../../modules/metamask/core/SecureKeychain';

@inject('store')
@observer
class Security extends React.Component {
  state = {
    language: {
      name: 'English',
      locale: 'en',
    },
    list: [
      {
        name: 'English',
        locale: 'en',
      },
      {
        name: '简体中文',
        locale: 'zh',
      },
    ],
  };

  componentDidMount = async () => {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    let bioEnabled = false;
    let passcodeEnabled = false;
    if (biometryType) {
      const biometryChoice = await AsyncStorage.getItem('@QHWallet:biometryChoice');
      if (biometryChoice !== '' && biometryChoice === biometryType) {
        bioEnabled = true;
      } else {
        const passcodeChoice = await AsyncStorage.getItem('@QHWallet:passcodeChoice');
        if (passcodeChoice !== '' && passcodeChoice === 'true') {
          passcodeEnabled = true;
        }
      }
    }
    this.setState({ biometryType, biometryChoice: bioEnabled, passcodeChoice: passcodeEnabled });
  };

  onSecuritySettingChange = async (enabled, type) => {
    if (type === 'biometrics') {
      this.setState({ biometryChoice: enabled });

      // If we're disabling biometrics, let's enable device passcode / pin
      //  by default because if we disable both we lose the password
      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:biometryChoiceDisabled', 'true');
        this.onSecuritySettingChange(true, 'passcode');
        return;
      }

      await AsyncStorage.removeItem('@QHWallet:biometryChoiceDisabled');
      await AsyncStorage.removeItem('@QHWallet:passcodeDisabled');

      const credentials = await SecureKeychain.getGenericPassword();
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type);
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true);
          }
        });
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type);
          }
        });
      }
    } else {
      this.setState({ passcodeChoice: enabled });

      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:passcodeDisabled', 'true');
      } else {
        await AsyncStorage.removeItem('@QHWallet:passcodeDisabled');
      }

      const credentials = await SecureKeychain.getGenericPassword();
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type);
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true);
          }
        });
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type);
          }
        });
      }
    }
  };

  onSecuritySettingChange = async (enabled, type) => {
    if (type === 'biometrics') {
      this.setState({ biometryChoice: enabled });

      // If we're disabling biometrics, let's enable device passcode / pin
      //  by default because if we disable both we lose the password
      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:biometryChoiceDisabled', 'true');
        this.onSecuritySettingChange(true, 'passcode');
        return;
      }

      await AsyncStorage.removeItem('@QHWallet:biometryChoiceDisabled');
      await AsyncStorage.removeItem('@QHWallet:passcodeDisabled');

      const credentials = await SecureKeychain.getGenericPassword();
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type);
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true);
          }
        });
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type);
          }
        });
      }
    } else {
      this.setState({ passcodeChoice: enabled });

      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:passcodeDisabled', 'true');
      } else {
        await AsyncStorage.removeItem('@QHWallet:passcodeDisabled');
      }

      const credentials = await SecureKeychain.getGenericPassword();
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type);
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true);
          }
        });
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type);
          }
        });
      }
    }
  };

  render() {
    const { approvalModalVisible, biometryType, browserHistoryModalVisible } = this.state;

    const { language } = this.state
    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar  title={strings('settings.security')}/>
        {biometryType && (
          <Flex justify="between" style={styles.setting}>
            <Text style={styles.title}>
              {strings(`biometrics.enable_${this.state.biometryType.toLowerCase()}`)}
            </Text>
            <View style={styles.switchElement}>
              <Switch
                onValueChange={(
                  biometryChoice
                ) => this.onSecuritySettingChange(biometryChoice, 'biometrics')}
                value={this.state.biometryChoice}
              />
            </View>
          </Flex>
        )}
        {biometryType && !this.state.biometryChoice && (
          <Flex justify="between" style={styles.setting}>
          <Text style={styles.title}>
              {Device.isIos()
                ? strings(`biometrics.enable_device_passcode_ios`)
                : strings(`biometrics.enable_device_passcode_android`)}
            </Text>
            <View style={styles.switchElement}>
              <Switch
                onValueChange={(
                  passcodeChoice
                ) => this.onSecuritySettingChange(passcodeChoice, 'passcode')}
                value={this.state.passcodeChoice}
              />
            </View>
          </Flex>
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  setting: {
    padding: 10,
  }
})
export default Security