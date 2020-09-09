import { DeviceEventEmitter } from 'react-native'
import { persist } from 'mobx-persist'
import { observable, computed, action, when } from 'mobx'
import CryptoJS from 'crypto-js'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import EOSJS from 'eosjs'
import _ from 'lodash'
import Wallet from './Wallet'
import { WALLET_SOURCE_PK, WALLET_SOURCE_MW, COIN_TYPE_EOS, COIN_ID_EOS } from '../../config/const'
import { EOS } from './Coin'
// import Scatter from '../../modules/scatter'
import { eosRequest } from '../../utils/request'

export default class EOSWallet extends Wallet {
  @persist @observable index = 0

  @persist @observable pubkey = ''

  @persist @observable account = ''

  @persist @observable alias = ''

  lastNonce = -1
  EOS = new EOS()

  browserRecord = 'https://see.fo/accounts/'

  @computed get hasCreated() {
    return !!this.id
  }

  get defaultCoin() {
    return this.coins[0]
  }
  constructor(obj) {
    super(obj)
    if (obj) {
      if (obj.account) {
        this.account = obj.account
      }
      if (obj.alias) {
        this.alias = obj.alias
      }
      if (obj.name) {
        this.coins = [this.EOS]
      }
    }
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

  getBalanceTime = async () => {
    if (this.hasCreated) {
      await this.getBalance()
      setTimeout(() => {
        this.getBalanceTime()
      }, 30000)
    }
  }

  @action
  getBalance = async () => {
    if (this.name && this.hasCreated) {
      try {
        const rows = await eosRequest.getBalance(this.name)
        if (Array.isArray(rows)) {
          rows.forEach(item => {
            const { balance, symbol } = item
            if (symbol === 'EOS' && this.coins[0]) {
              this.coins[0].balance = Number(balance)
            }
          })
        }
      } catch (err) {
        console.warn(err)
      }
    }
  }

  @action
  autoCheckAccount = async mnemonic => {
    if (this.address) {
      try {
        const {
          data: { permissions },
        } = await eosRequest.getAddressByKey(this.address)
        if (Array.isArray(permissions) && permissions[0]) {
          this.name = account_names[0].account_name
          this.id = CryptoJS.MD5(this.name).toString()
          this.pubkey = this.address
          const seed = bip39.mnemonicToSeedSync(mnemonic)
          const node = bip32.fromSeed(seed)
          const path = `m/44'/${COIN_ID_EOS}'/0'/0/${this.index}`
          const child = node.derivePath(path)
          const privateKey = EOSJS.modules.ecc.PrivateKey(child.privateKey).toString()
          return privateKey
        }
      } catch (error) {
        console.warn(error)
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
    this.type = COIN_TYPE_EOS
  }

  getPublicKey = mnemonic => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const node = bip32.fromSeed(seed)
    const path = `m/44'/${COIN_ID_EOS}'/0'/0/${this.index}`
    this.path = path
    const child = node.derivePath(path)
    const pubkey = EOSJS.modules.ecc.privateToPublic(child.privateKey, 'EOS') // 公钥
    return pubkey
  }

  static import(mnemonic, pwd, name = '') {
    this.pwd = pwd
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const node = bip32.fromSeed(seed)
        const path = `m/44'/${COIN_ID_EOS}'/0'/0/0`
        const child = node.derivePath(path)
        const pubkey = EOSJS.modules.ecc.privateToPublic(child.privateKey, 'EOS') // 公钥
        const address = pubkey
        const obj = {
          pubkey,
          address,
          name,
          pwd,
          alias: name,
          type: COIN_TYPE_EOS,
          source: WALLET_SOURCE_MW,
        }

        const act = new EOSWallet(obj)
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importPK(pk, pwd, name, alias) {
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
          type: COIN_TYPE_EOS,
          source: WALLET_SOURCE_PK,
        }
        let act = new EOSWallet(obj)
        DeviceEventEmitter.emit('accountOnChange')
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static privateToPublic(pk) {
    return EOSJS.modules.ecc.privateToPublic(pk, 'EOS')
  }
}
