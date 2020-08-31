import { action, observable } from 'mobx';
import _ from 'lodash'
import { persist } from 'mobx-persist';

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
}
