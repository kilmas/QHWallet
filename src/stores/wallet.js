import { action, observable } from 'mobx';
import _ from 'lodash'
import { persist } from 'mobx-persist';
import Encryptor from '../modules/metamask/core/Encryptor';
import SecureKeychain from '../modules/metamask/core/SecureKeychain';

export default class Store {
  //当前使用钱包
  @observable current = null;

  @observable BTC = 0;

  @observable USDT = 0;

  @persist @observable dataText = '';

  @action
  setMyBalance = (token, balance) => {
    switch (token) {
      case 'BTC':
        this.BTC = balance;
        break;
      case 'USDT':
        this.USDT = balance;
        break;
      default:
    }
  }

  @action
  insertData = async account => {
    let result;
    try {
      result = this.dataText;
      const encryptor = new Encryptor();
      const keychainObject = await SecureKeychain.getGenericPassword()
      if (result) {
        const data = await encryptor.decrypt(keychainObject.password, result);
        if (_.isArray(data)) {
          if (!data.find(item => item.account === account)) {
            data.push({ account });
            this.dataText = await encryptor.encrypt(keychainObject.password, data);
          }
        }
      } else {
        const data = [{ account }];
        this.dataText = await encryptor.encrypt(keychainObject.password, data)
      }
    } catch (error) {
      console.log(error)
    }
  }
}
