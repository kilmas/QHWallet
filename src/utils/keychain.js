import { Toast } from "@ant-design/react-native";
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

export default setKeyChain;