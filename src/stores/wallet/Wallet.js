import { observable, computed, reaction } from "mobx";
import { persist } from 'mobx-persist'
import _ from 'lodash'
import { toFixedNumber } from "../../utils/NumberUtil";
import { WALLET_SOURCE_MW, WALLET_SOURCE_PK, WALLET_SOURCE_KS } from "../../config/const";
import Coin from "./Coin";
import WalletTxStore from "./WalletTxStore";
const STORAGE_KEY_WALLET_LIST = "STORAGE_KEY_WALLET_LIST_v1";

export default class Wallet {
  static WALLET_TYPE_ETH = 1;
  static WALLET_TYPE_BTC = 2;
  static WALLET_TYPE_FO = 8;
  hdId;

    /**
   * bip44 path
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable name;
  /**
   *
   * @type {bool}
   * @memberof Wallet
   */
  @persist @observable isBackup = false;
  /**
   *
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable id = '';
  /**
   *
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable type = null;

  /**
   *
   * @type {WALLET_SOURCE_MW|WALLET_SOURCE_PK|WALLET_SOURCE_KS}
   * @memberof Wallet
   */
  @persist @observable source = WALLET_SOURCE_MW;
  /**
   *
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable address;
  /**
   * bip44 path
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable path;
  /**
   *
   * @type {string}
   * @memberof Wallet
   */
  @persist @observable pwdnote;
  /**
   *
   * @type {Array.<Coin>}}
   * @memberof Wallet
   */
  @persist('list') @observable coins = [];

  txStore = new WalletTxStore();
  /**
   * 默认Coin, 用于矿工费计算
   * @type {Coin}
   * @readonly
   * @memberof Wallet
   */
  get defaultCoin() {
    return null;
  }

  get txListParams() {
    return {
      address: this.address,
    };
  }

  constructor(obj) {
    this.rocover(obj)
  }

  rocover (obj) {
    if (_.isPlainObject(obj)) {
      this.id = obj.id || obj.walletID;
      this.hdId = obj.hdId;
      this.name = obj.name;
      this.type = obj.type;
      this.address = obj.address;
      this.path = obj.path;
      this.pwdnote = obj.pwdnote;
      this.source = obj.source;
      this.coins = obj.coins || [];
      this.isBackup = obj.isBackup || false;
      if (this.source !== WALLET_SOURCE_MW) {
        this.isBackup = true;
      }
    }
  }
  
  static match(id) {
    for (let index = 0; index < this.list.length; index++) {
      const element = this.list[index];
      if (element.id == id) {
        return element;
      }
    }
  }
  /**
   * 创建钱包
   *
   * @static
   * @param {string} name
   * @param {string} pwd
   * @returns
   * @memberof Wallet
   */
  static create(name, pwd, note) {
    throw "not implemented create";
  }
  static import(mnemonic, pwd, name, note) {
    throw "not implemented import";
  }

  static importPK(pk, pwd, name, note) {
    throw "not implemented import";
  }
  /**
   * 将当前钱包信息存储到localStorage
   * @param {number} index
   * @returns {Promise<void>}
   * @memberof Wallet
   */
  save(index = -1) {
    return;
  }
  drop(text) {}
  startObserve() {
    reaction(
      () => this.assetPrice,
      assetPrice => {
        this.save(-2);
      }
    );
    reaction(
      () => this.coins.map(coin => coin.balance),
      () => {
        this.save(-2);
      }
    );
  }
  /**
   * 资产总额
   *
   * @type {number}
   * @readonly
   * @memberof Wallet
   */
  @computed get assetPrice() {
    const coins = this.coins.filter(coin => coin.display);
    return toFixedNumber(
      coins.reduce((sum, coin) => sum + coin.totalPrice, 0),
      2
    );
  }
  /**
   *今日浮动
   *
   * @type {number}
   * @readonly
   * @memberof Wallet
   */
  @computed get floatingAssetPrice() {
    const coins = this.coins.filter(coin => coin.display);
    return toFixedNumber(
      coins.reduce((sum, coin) => sum + coin.floatingTotalPrice, 0),
      2
    );
  }
  fetchAsset() {
    throw this.constructor.name + "not implemented fetchAsset";
  }
  findCoin = coinID => {
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (coin.id == coinID) {
        return coin;
      }
    }

    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (coin.name.toUpperCase() === (`${coinID}`).toUpperCase()) {
        return coin;
      }
    }
  };
  checkMaliciousAddress(address) {
    throw "not implemented checkMaliciousAddress";
  }
  paymentScheme(amount, coin) {
    throw "not implemented paymentScheme";
  }
  decodePaymentScheme(scheme) {
    return scheme;
  }
}

class ExtendedKey {
  /**
   *
   * @type {string}
   * @memberof ExtendedKey
   */
  @persist @observable key;

  /**
   *
   * @type {string}
   * @memberof ExtendedKey
   */
  @persist @observable path;

  constructor(obj = {}) {
    this.key = obj.key;
    this.path = obj.path;
  }
}

class BIP44Address {
  /**
   *
   * @type {String}
   * @memberof BIP44Address
   */
  @persist @observable address = '';

  /**
   *
   * @type {String}
   * @memberof BIP44Address
   */
  @persist @observable path = '';

  /**
   *
   * @type {String}
   * @memberof BIP44Address
   */
  @persist @observable pubkey = '';

  constructor({ address = '', path = '', pubkey = '' } = {}) {
    this.address = address;
    this.path = path;
    this.pubkey = pubkey;
  }
}

export { ExtendedKey, BIP44Address };
