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
      console.log('Credentials successfully loaded for user ');
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

export const isBiometry = async () => {
  const biometryChoice = await AsyncStorage.getItem('@QHWallet:biometryChoice');
  const biometryType = await SecureKeychain.getSupportedBiometryType()
  if (biometryChoice !== '' && biometryChoice === biometryType) {
    return true
  }
  return false
}

export const authSubmit = async (callback) => {
  try {
    const biometry = await isBiometry()
    const submit = () => {

    }
    if (biometry) {
      try {
        const { password } = await SecureKeychain.getGenericPassword()
        callback(null, password)
      } catch (e) {
        callback('cancel')
      }
      return
    } else {
      Modal.prompt(
        'Please input your password',
        'Save it carefully!',
        async (pwd) => {
          try {
            const { password } = await SecureKeychain.getGenericPassword()
            if (password === pwd) {
              callback(null, password)
            } else {
              callback('password fail')
            }
          } catch (e) {
            console.warn(e)
            callback('cancel')
          }
        },
        'secure-text',
        ''
      )
    }
  } catch (error) {
    callback(false)
    console.warn(error);
  }
}

export default setKeyChain;