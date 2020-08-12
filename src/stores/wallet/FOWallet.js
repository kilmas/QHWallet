import {  DeviceEventEmitter } from "react-native";
import { persist } from 'mobx-persist'
import { observable, computed, action } from "mobx";
import CryptoJS from 'crypto-js';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import FIBOS from 'fibos.js';
import Wallet from "./Wallet";
import {
  WALLET_SOURCE_PK,
  WALLET_SOURCE_MW,
  COIN_TYPE_FO,
  COIN_ID_FO,
} from "../../config/const";
import { FO } from "./Coin";

export default class  FOWallet extends Wallet {

  @persist @observable index = 0;
  lastNonce = -1;
  FO = new FO();

  browserRecord = 'https://see.fo/accounts/'

  @computed get hasCreated() {
    return !!this.id;
  }

  get defaultCoin() {
    return this.coins[0];
  }
  constructor(obj) {
    super(obj);
    this.coins = [this.FO]
  }

  @action createAccount(obj) {
    const mnemonic = obj.mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    const path = `m/44'/${COIN_ID_FO}'/0'/0/${this.index}`
    const child = node.derivePath(path);
    const pubkey = FIBOS.modules.ecc.privateToPublic(child.privateKey); //公钥
    const address = obj.name;
    this.address = address
    this.pubkey = pubkey
    // this.prikey = prikey
    this.name = obj.name
    this.path = path
    this.id = CryptoJS.MD5(obj.name).toString()
    this.type = COIN_TYPE_FO
  }
  
  static import(mnemonic, pwd, name = "") {
    this.pwd = pwd
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const node = bip32.fromSeed(seed);
        const path = `m/44'/${COIN_ID_FO}'/0'/0/0`
        const child = node.derivePath(path);
        const pubkey = FIBOS.modules.ecc.privateToPublic(child.privateKey); // 公钥
        const address = name;
        const obj = {
          pubkey,
          address,
          type: COIN_TYPE_FO,
          name,
          pwd,
        };

        const act = new FOWallet({ ...obj, source: WALLET_SOURCE_MW });
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }

  static importPK(pk, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const address = FIBOS.modules.ecc.privateToPublic(pk);
        const obj = {
          id: CryptoJS.MD5(name).toString(),
          name,
          address,
          pwd,
          pwdnote: note,
          isBackup: true,
          pubkey: address,
          type: COIN_TYPE_FO,
          source: WALLET_SOURCE_PK
        };
        let act = new FOWallet(obj);
        DeviceEventEmitter.emit("accountOnChange");
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }

  static privateToPublic(pk) {
    return FIBOS.modules.ecc.privateToPublic(pk);
  }

  static importKS(ks, pwd, name, note) {}
  static backupMnemonic(mnemonic) {};
  drop = text => {};
  async isVaildPassword(pwd) {
    return true;
  }
}
