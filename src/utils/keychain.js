import { Toast, Modal } from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import SecureKeychain from "../modules/metamask/core/SecureKeychain";

const setKeyChain = async (username, password) => {
  await SecureKeychain.setGenericPassword(username, password, {
    accessControl: SecureKeychain.ACCESS_CONTROL.WHEN_UNLOCKED_THIS_DEVICE_ONLY
  });
  try {
    const credentials = await SecureKeychain.getGenericPassword();
    if (credentials) {
      console.log('Credentials successfully loaded for user ', credentials);
      return true;
    } else {
      console.log('No credentials stored');
    }
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
    Toast.fail('Create credentials failed');
    return false;
  }
}

export const authSubmit = async (callback) => {
  try {
    const biometryChoice = await AsyncStorage.getItem('@QHWallet:biometryChoice');
    const { password } = await SecureKeychain.getGenericPassword()
    const biometryType = await SecureKeychain.getSupportedBiometryType()
    if (biometryChoice !== '' && biometryChoice === biometryType) {
      callback(password)
      return
    }
    Modal.prompt(
      'Please input your password',
      'Save it carefully!',
      (pwd) => {
        if (password === pwd) {
          callback(pwd)
        } else {
          callback(null)
        }
      },
      'secure-text',
      ''
    )
  } catch (error) {
    callback(false)
    console.warn(error);
  }
}

export default setKeyChain;