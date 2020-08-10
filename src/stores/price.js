import {action, observable} from 'mobx';

class Store {
  rate = Math.pow(10, 8);
  //当前使用钱包
  @observable BTC = 0;

  @action
  setBTC = btcPrice => {
    this.BTC = btcPrice;
  };
}

export default new Store();
