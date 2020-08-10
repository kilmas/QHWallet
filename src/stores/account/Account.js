import { computed, observable } from "mobx";
import _ from "lodash";
import CryptoJS  from "crypto-js"
import { persist } from 'mobx-persist'

class Account {
  @persist @observable id = null;
  /**
   *
   * @type { String }
   * @memberof MultiChainAccount
   */
  @persist @observable name = '';
  @persist @observable type = null;
  @computed get totalAsset() {
    throw new Error("not implemented totalAsset");
  }
  @computed get floatingAsset() {
    throw new Error("not implemented floatingAsset");
  }

  /**
   * 更新account相关业务数据
   *
   * @memberof Account
   */
  update = async () => {
    throw new Error("not implemented update");
  };

  constructor(obj = {}) {
    this.id = obj.id;
    this.name = obj.name;
    this.type = obj.type;
  }
  generateWalletID = data => {
    const hash = CryptoJS.SHA256(data).toString();
    const salt = CryptoJS.SHA256("wallet.qingah.com").toString();
    return CryptoJS.SHA3(hash + salt, { outputLength: 256 }).toString();
  };
}

export default Account;
