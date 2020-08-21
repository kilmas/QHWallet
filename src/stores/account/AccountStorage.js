import AsyncStorage from '@react-native-community/async-storage';
import _ from "lodash";
import { ACCOUNT_TYPE_EXCHANGE, ACCOUNT_TYPE_HD, NETWORK_ENV_TESTNET } from "../../config/const";
import Encryptor from '../../modules/metamask/core/Encryptor';

const STORAGE_KEY_ACCOUNTSTORE_MAINNET = "STORAGE_KEY_ACCOUNTSTORE_MAINNET_V1";
const STORAGE_KEY_ACCOUNTSTORE_TESTNET = "STORAGE_KEY_ACCOUNTSTORE_TESTNET_V1";

const encryptor = new Encryptor();

class AccountStorage {
  accounts = [];
  env;
  constructor() { }
  setup = async env => {
    let result;
    this.env = env;
    try {
      result = await AsyncStorage.getItem(
        env === NETWORK_ENV_TESTNET ? STORAGE_KEY_ACCOUNTSTORE_TESTNET : STORAGE_KEY_ACCOUNTSTORE_MAINNET
      );
      result = JSON.parse(result) || {};
    } catch (error) {
      console.log(error)
    }
    return result || {};
  };
  insert = async account => {
    let index = this.accounts.length;
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id === account.id) {
        index = i;
        break;
      }
    }
    this.accounts[index] = { id: account.id };
    if (account.type != ACCOUNT_TYPE_EXCHANGE) {
      await this.update();
    }
  };
  drop = async account => {
    if (account.type === ACCOUNT_TYPE_HD) {
      account.wallets = [];
      account.BTCWallet = undefined;
      account.ETHWallet = undefined;
    } else {
      let index = this.accounts.length;
      for (let i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i].id === account.id) {
          index = i;
          break;
        }
      }
      this.accounts.splice(index, 1);
    }

    await this.update();
  };
  update = _.debounce(
    async () => {
      return await AsyncStorage.setItem(
        this.env === NETWORK_ENV_TESTNET ? STORAGE_KEY_ACCOUNTSTORE_TESTNET : STORAGE_KEY_ACCOUNTSTORE_MAINNET,
        JSON.stringify(this.accounts)
      );
    },
    1000 * 2,
    {
      maxWait: 1000 * 6,
    }
  );
  delDataByID = async (id) => {
    return await AsyncStorage.removeItem(id);
  }
  setDataByID = async (id, data, pwd) => {
    try {
      const dataText = await encryptor.encrypt(id + pwd, data);
      return await AsyncStorage.setItem(id, dataText);
    } catch (error) {
      console.warn(error)
    }
  }
  getDataByID = async (id, pwd) => {
    try {
      const result = await AsyncStorage.getItem(id);
      const data = await encryptor.decrypt(id + pwd, result);
      return data;
    } catch (error) {
      console.warn(error)
    }
    return {}
  }
}
export default new AccountStorage();
