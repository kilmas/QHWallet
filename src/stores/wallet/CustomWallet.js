import { DeviceEventEmitter } from 'react-native'
import { persist } from 'mobx-persist'
import { observable, computed, action, when } from 'mobx'
import CryptoJS from 'crypto-js'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import _ from 'lodash'
import Wallet from './Wallet'
import { WALLET_SOURCE_PK, WALLET_SOURCE_MW, COIN_ID_EOS } from '../../config/const'

export default class CustomWallet extends Wallet {
  @persist @observable index = 0

  @persist @observable pubkey = ''

  @persist @observable account = ''

  @persist @observable alias = ''

  @persist @observable bip44

  lastNonce = -1

  @computed get hasCreated() {
    return !!this.id
  }

  get defaultCoin() {
    return this.coins[0]
  }

  constructor(obj) {
    super(obj)
    if (!this.account) {
      this.account = this.name
    }
    when(
      () => !!this.id,
      () => {
        this.getBalanceTime()
      }
    )
  }

  getBalanceTime = async () => {}

  @action
  getBalance = async () => {
    if (this.name && this.hasCreated) {
      try { } catch (err) {
        console.warn(err)
      }
    }
  }

  @action createAccount(obj) {
    const mnemonic = obj.mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const node = bip32.fromSeed(seed)
    const path = `m/44'/${COIN_ID_EOS}'/0'/0/${this.index}`
    const child = node.derivePath(path)
    const pubkey = EOSJS.modules.ecc.privateToPublic(child.privateKey, 'EOS') //公钥
    const address = obj.name
    this.address = address
    this.pubkey = pubkey
    this.name = obj.name
    this.path = path
    this.id = CryptoJS.MD5(obj.name).toString()
    this.type = obj.bip
  }

  getPublicKey = (mnemonic, bip) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const node = bip32.fromSeed(seed)
    const path = `m/44'/${bip}'/0'/0/${this.index}`
    this.path = path
    const child = node.derivePath(path)
    return child.publicKey.toString('hex')
  }

  static import(mnemonic, pwd, name = '', bip) {
    this.pwd = pwd
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const node = bip32.fromSeed(seed)
        const path = `m/44'/${bip}'/0'/0/0`
        const child = node.derivePath(path)
        const address = pubkey
        const obj = {
          pubkey: child.publicKey.toString('hex'),
          address,
          name,
          pwd,
          alias: name,
          type: bip,
          source: WALLET_SOURCE_MW,
        }

        const act = new CustomWallet(obj)
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importPK(pk, pwd, name, alias, bip) {
    return new Promise(async (resolve, reject) => {
      try {
        const address = EOSJS.modules.ecc.privateToPublic(pk, 'EOS')
        const obj = {
          id: CryptoJS.MD5(name).toString(),
          name,
          address,
          pwd,
          account: name,
          alias,
          isBackup: true,
          pubkey: address,
          type: bip,
          source: WALLET_SOURCE_PK,
        }
        let act = new CustomWallet(obj)
        DeviceEventEmitter.emit('accountOnChange')
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }
}
