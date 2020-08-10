import { DeviceEventEmitter } from "react-native";
import { observable, action, reaction } from "mobx";
import { persist } from 'mobx-persist'
import CryptoJS from 'crypto-js';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import Wallet from "./Wallet";
import {
  WALLET_SOURCE_PK,
  WALLET_SOURCE_MW,
  WALLET_SOURCE_KS,
  COIN_TYPE_ETH,
} from "../../config/const";
import _ from "lodash";
import Accounts from "web3-eth-accounts";
import { ETH } from "./Coin";

const ethAccounts = new Accounts()

export default class ETHWallet extends Wallet {
  lastNonce = -1;
  ETH = new ETH();

  @persist @observable index = '1';

  get defaultCoin() {
    return this.coins[0];
  }

  constructor(obj) {
    super(obj);
    this.coins = [this.ETH];
    this.startObserve();
  }
  static create(name, pwd) {
    return new Promise(async (resolve, reject) => {
      let obj = {
        pwd
      };
      let mnemonic = obj.mnemonic;
      let act = new ETHWallet({ ...obj, source: WALLET_SOURCE_MW });
      act.name = name;
      act.save();
      resolve({ act, mnemonic });
      DeviceEventEmitter.emit('accountOnChange')
    });
  }
  static import(mnemonic, pwd, name = "") {
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const node = bip32.fromSeed(seed);
        const path = "m/44'/60'/0'/0/0"
        const child = node.derivePath(path);
        const { address } = ethAccounts.privateKeyToAccount(child.privateKey.toString('hex'));
        const obj = {
          address,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_ETH
        };

        let act = new ETHWallet({ ...obj, source: WALLET_SOURCE_MW });
        act.pwd = pwd;
        act.name = name;
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }

  static importPK(pk, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const { address } = ethAccounts.privateKeyToAccount(pk);
        const obj = {
          address,
          id: CryptoJS.MD5(address).toString(),
          source: WALLET_SOURCE_PK,
          type: COIN_TYPE_ETH
        };

        let act = new ETHWallet({ ...obj, source: WALLET_SOURCE_PK });
        act.name = name;
        act.pwdnote = note;
        act.pwd = pwd;
        act.isBackup = true;
        act.save();
        DeviceEventEmitter.emit("accountOnChange");
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }
  static importKS(ks, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const { address, privateKey } = ethAccounts.decrypt(ks, pwd);
        const obj = {
          address,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_ETH,
          keystore: ks,
        };

        let act = new ETHWallet({ ...obj, source: WALLET_SOURCE_KS });
        act.name = name;
        act.pwdnote = note;
        act.isBackup = true;
        act.save();
        DeviceEventEmitter.emit("accountOnChange");
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }
  drop = text => {};
  async isVaildPassword(pwd) {
    return true
  }
  async getKeyStore(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
  }
  async exportPrivateKey(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
  }
  async exportMnemonic(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
  }
}

