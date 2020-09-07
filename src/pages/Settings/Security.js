import React from 'react'
import { Text, View, StyleSheet, Alert } from 'react-native'
import { Switch, Flex } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import AsyncStorage from '@react-native-community/async-storage'
import TitleBar from '../../components/TitleBar'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import { BGGray } from '../../theme'
import Device from '../../utils/devices'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import AppConstants from '../../modules/metamask/core/AppConstants'

class Security extends React.Component {
  state = {
    credentials: {},
  }

  componentDidMount = async () => {
    const biometryType = await SecureKeychain.getSupportedBiometryType()
    let bioEnabled = false
    let passcodeEnabled = false
    if (biometryType) {
      const biometryChoice = await AsyncStorage.getItem('@QHWallet:biometryChoice')
      if (biometryChoice !== '' && biometryChoice === biometryType) {
        bioEnabled = true
      } else {
        const passcodeChoice = await AsyncStorage.getItem('@QHWallet:passcodeChoice')
        if (passcodeChoice !== '' && passcodeChoice === 'true') {
          passcodeEnabled = true
        }
      }
    }
    const credentials = await SecureKeychain.getGenericPassword()
    this.setState({ biometryType, biometryChoice: bioEnabled, passcodeChoice: passcodeEnabled, credentials })
  }

  onSecuritySettingChange = async (enabled, type) => {
    if (type === 'biometrics') {
      this.setState({ biometryChoice: enabled })

      // If we're disabling biometrics, let's enable device passcode / pin
      //  by default because if we disable both we lose the password
      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:biometryChoiceDisabled', 'true')
        this.onSecuritySettingChange(false, 'passcode')
        return
      }

      await AsyncStorage.removeItem('@QHWallet:biometryChoiceDisabled')
      await AsyncStorage.removeItem('@QHWallet:passcodeDisabled')

      const credentials = await SecureKeychain.getGenericPassword()
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type)
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true)
          },
        })
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type)
          },
        })
      }
    } else {
      this.setState({ passcodeChoice: enabled })

      if (!enabled) {
        await AsyncStorage.setItem('@QHWallet:passcodeDisabled', 'true')
      } else {
        await AsyncStorage.removeItem('@QHWallet:passcodeDisabled')
      }

      const credentials = await SecureKeychain.getGenericPassword()
      if (credentials && credentials.password !== '') {
        this.storeCredentials(credentials.password, enabled, false, type)
      } else if (this.props.passwordHasBeenSet) {
        this.props.navigation.navigate('EnterPasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, true, false, type, true)
          },
        })
      } else {
        this.props.navigation.navigate('ChoosePasswordSimple', {
          onPasswordSet: password => {
            this.storeCredentials(password, enabled, true, type)
          },
        })
      }
    }
  }

  storeCredentials = async (password, enabled, restore, type, validate = false) => {
    try {
      await SecureKeychain.resetGenericPassword()

      if (restore) {
        console.log('SecuritySettings::Restoring wallet from SecuritySettings after setting password')
        // We have to restore the entire keyring
        // to re-encrypt it with a new password
        const { KeyringController, PreferencesController } = Engine.context
        const { keyrings, selectedAddress } = this.props
        const mnemonic = await KeyringController.exportSeedPhrase('')
        const seed = JSON.stringify(mnemonic).replace(/"/g, '')

        // Also regenerate the accounts
        let accountLength = 1
        const allKeyrings = keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings
        for (const keyring of allKeyrings) {
          if (keyring.type === 'HD Key Tree') {
            accountLength = keyring.accounts.length
            break
          }
        }
        console.log('SecuritySettings::Got the account count')
        await KeyringController.createNewVaultAndRestore(password, seed)
        console.log('SecuritySettings::Keyring created and re-encrypted')
        for (let i = 0; i < accountLength - 1; i++) {
          await KeyringController.addNewAccount()
        }
        console.log('SecuritySettings::selecting address')
        // Finally set the same selected address
        PreferencesController.setSelectedAddress(selectedAddress)
        console.log('SecuritySettings::restore complete')
      }

      // When there's no need to restore and we just need
      // to store the existing password in the keychain,
      // we need to validate it first
      if (validate) {
        await Engine.context.KeyringController.exportSeedPhrase(password)
      }

      await AsyncStorage.setItem('@QHWallet:existingUser', 'true')
      if (enabled) {
        const authOptions = {
          // authenticationType: SecureKeychain.AUTHENTICATION_TYPE.BIOMETRICS,
          accessControl:
            type === 'biometrics' ? SecureKeychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE : SecureKeychain.ACCESS_CONTROL.DEVICE_PASSCODE,
        }
        await SecureKeychain.setGenericPassword(this.state.credentials.username, password, authOptions)

        if (type === 'biometrics') {
          await AsyncStorage.setItem('@QHWallet:biometryChoice', this.state.biometryType)
          await AsyncStorage.removeItem('@QHWallet:passcodeChoice')
          // If the user enables biometrics, we're trying to read the password
          // immediately so we get the permission prompt
          if (Device.isIos()) {
            await SecureKeychain.getGenericPassword()
          }
        } else {
          await AsyncStorage.setItem('@QHWallet:passcodeChoice', 'true')
          await AsyncStorage.removeItem('@QHWallet:biometryChoice')
        }
      } else {
        await SecureKeychain.setGenericPassword(this.state.credentials.username, password, {
          accessible: SecureKeychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        })
        await AsyncStorage.removeItem('@QHWallet:biometryChoice')
        await AsyncStorage.removeItem('@QHWallet:passcodeChoice')
      }

      this.props.passwordSet()

      if (enabled && this.props.lockTime === -1) {
        console.log('Setting locktime to ', AppConstants.DEFAULT_LOCK_TIMEOUT)
        this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT)
      } else {
        console.log('Locktime was set to', this.props.lockTime)
      }
    } catch (e) {
      if (e.message === 'Invalid password') {
        Alert.alert(strings('app_settings.invalid_password'), strings('app_settings.invalid_password_message'))
      }
      console.error(e, 'SecuritySettings:biometrics')
      // Return the switch to the previous value
      if (type === 'biometrics') {
        this.setState({ biometryChoice: !enabled })
      } else {
        this.setState({ passcodeChoice: !enabled })
      }
    }
  }

  render() {
    const { biometryType } = this.state

    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar title={strings('settings.security')} />
        {biometryType && (
          <Flex justify="between" style={styles.setting}>
            <Text style={styles.title}>{strings(`biometrics.enable_${this.state.biometryType.toLowerCase()}`)}</Text>
            <View style={styles.switchElement}>
              <Switch
                onChange={biometryChoice => {
                  this.onSecuritySettingChange(biometryChoice, 'biometrics')
                }}
                onValueChange={biometryChoice => this.onSecuritySettingChange(biometryChoice, 'biometrics')}
                checked={this.state.biometryChoice}
              />
            </View>
          </Flex>
        )}
        {/* {biometryType && !this.state.biometryChoice && (
          <Flex justify="between" style={styles.setting}>
            <Text style={styles.title}>
              {Device.isIos()
                ? strings(`biometrics.enable_device_passcode_ios`)
                : strings(`biometrics.enable_device_passcode_android`)}
            </Text>
            <View style={styles.switchElement}>
              <Switch
                onChange={(passcodeChoice) => {
                  this.onSecuritySettingChange(passcodeChoice, 'passcode')
                }}
                onValueChange={(
                  passcodeChoice
                ) => this.onSecuritySettingChange(passcodeChoice, 'passcode')}
                checked={this.state.passcodeChoice}
              />
            </View>
          </Flex>
        )} */}
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  setting: {
    padding: 10,
  },
})

export default inject(({ store: state }) => ({
  approvedHosts: state.privacy.approvedHosts,
  browserHistory: state.browser.history,
  lockTime: state.settings.lockTime,
  privacyMode: state.privacy.privacyMode,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  identities: state.engine.backgroundState.PreferencesController.identities,
  keyrings: state.engine.backgroundState.KeyringController.keyrings,
  passwordHasBeenSet: state.settings.passwordSet,
  setLockTime: state.settings.setLockTime,
  passwordSet: state.settings.setPassword,
}))(observer(Security))
