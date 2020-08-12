import { DeviceEventEmitter } from 'react-native'
import { persist } from 'mobx-persist'
import { observable, computed, action, reaction } from 'mobx'
import _ from 'lodash'
import CryptoJS from 'crypto-js'
import { crypto } from '@okchain/javascript-sdk'
import Wallet from './Wallet'
import { WALLET_SOURCE_PK, WALLET_SOURCE_MW, COIN_TYPE_OKT, COIN_ID_OKT } from '../../config/const'
import { OKT } from './Coin'
import OKClient from '../../modules/okchain'

export default class OKTWallet extends Wallet {
  @persist @observable index = 0
  lastNonce = -1
  OKT = new OKT()

  @computed get hasCreated() {
    return !!this.id
  }

  browserRecord = 'https://www.oklink.com/okchain-test/address/'

  @persist @observable account = ''

  get defaultCoin() {
    return this.coins[0]
  }

  constructor(obj) {
    super(obj)
    this.coins = [this.OKT]
    if (!obj) {
      // this.recoverWallet()
    }
    setTimeout(() => {
      this.getBalanceTime()
    }, 3000)
  }


  startObserve = () => {
    super.startObserve();
  };

  getBalanceTime = async () => {
    await this.getBalance()
    setTimeout(() => {
      this.getBalanceTime()
    }, 30000)
  }

  @action
  getBalance = async () => {
    const { oKClient } = OKClient
    if (this.address && oKClient) {
      const balances = await oKClient.getBalance(this.address)
      if (_.isArray(balances)) {
        balances.forEach(item => {
          if (item.denom === 'tokt') {
            this.OKT.balance = Number(item.amount)
            this.coins = [this.OKT]
          }
        })
      }
    }
  }

  @action
  getPrice = async () => {
    setTimeout(() => {
      this.getPrice()
    }, 30000)
  }

  recoverWallet = mnemonic => {
    crypto.getPrivateKeyFromMnemonic(mnemonic)
  }

  exportPKByMnemonic = mnemonic => {
    const privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic)
    return privateKey
  }
  static import(mnemonic, pwd, name = '') {
    this.pwd = pwd
    return new Promise(async (resolve, reject) => {
      try {
        const path = `m/44'/${COIN_ID_OKT}'/0'/0/0`
        const privateKey = crypto.getPrivateKeyFromMnemonic(mnemonic)
        const pubkey = crypto.getPubKeyHexFromPrivateKey(privateKey) // 公钥
        const address = crypto.getAddressFromPubKey(pubkey)
        const obj = {
          id: CryptoJS.MD5(address).toString(),
          source: WALLET_SOURCE_MW,
          pubkey,
          address,
          type: COIN_TYPE_OKT,
          name,
          pwd,
          path,
        }

        const act = new OKTWallet(obj)
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importPK(pk, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const pubkey = crypto.getPubKeyHexFromPrivateKey(pk) // 公钥
        const address = crypto.getAddressFromPubKey(pubkey)
        const obj = {
          id: CryptoJS.MD5(address).toString(),
          name,
          address,
          pwd,
          pwdnote: note,
          isBackup: true,
          pubkey,
          type: COIN_TYPE_OKT,
          source: WALLET_SOURCE_PK,
        }
        let act = new OKTWallet(obj)
        DeviceEventEmitter.emit('accountOnChange')
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importKS(ks, pwd, name, note) { }
  static backupMnemonic(mnemonic) { }
  drop = text => { }
  async isVaildPassword(pwd) {
    return true
  }
}
