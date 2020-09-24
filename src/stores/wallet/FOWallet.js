import { DeviceEventEmitter } from 'react-native'
import { persist } from 'mobx-persist'
import { observable, computed, action, when } from 'mobx'
import CryptoJS from 'crypto-js'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import FIBOS from 'fibos.js'
import _ from 'lodash'
import Wallet from './Wallet'
import { WALLET_SOURCE_PK, WALLET_SOURCE_MW, COIN_TYPE_FO, COIN_ID_FO } from '../../config/const'
import { FO } from './Coin'
import Ironman from '../../modules/ironman'
import { fibosRequest } from '../../utils/request'

export default class FOWallet extends Wallet {
  @persist @observable index = 0

  @persist @observable pubkey = ''

  @persist @observable account = ''

  @persist @observable alias = ''

  lastNonce = -1
  FO = new FO()

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
        this.coins = [this.FO]
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
    const { fibos } = Ironman
    if (this.name && this.hasCreated && fibos) {
      try {
        const { rows } = await fibos.getTableRows(true, 'eosio.token', this.name, 'accounts', 'primary', 0, 5000, 5000)
        if (Array.isArray(rows)) {
          rows.forEach(item => {
            const [balance, token] = _.get(item, 'balance.quantity', '').split(' ')
            if (token === 'FO' && this.coins[0]) {
              this.coins[0].balance = Number(balance)
              // this.FO.setBalance(Number(balance))
              // this.coins = [this.FO]
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
          data: { account_names },
        } = await fibosRequest.post('/v1/history/get_key_accounts', { public_key: this.address })
        if (Array.isArray(account_names) && account_names[0]) {
          this.name = account_names[0]
          this.id = CryptoJS.MD5(this.name).toString()
          this.pubkey = this.address
          const seed = bip39.mnemonicToSeedSync(mnemonic)
          const node = bip32.fromSeed(seed)
          const path = `m/44'/${COIN_ID_FO}'/0'/0/${this.index}`
          const child = node.derivePath(path)
          const privateKey = FIBOS.modules.ecc.PrivateKey(child.privateKey).toString()
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
    const path = `m/44'/${COIN_ID_FO}'/0'/0/${this.index}`
    const child = node.derivePath(path)
    const pubkey = FIBOS.modules.ecc.privateToPublic(child.privateKey) //公钥
    const address = obj.name
    this.address = address
    this.pubkey = pubkey
    this.name = obj.name
    this.path = path
    this.id = CryptoJS.MD5(obj.name).toString()
    this.type = COIN_TYPE_FO
  }

  getPublicKey = mnemonic => {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const node = bip32.fromSeed(seed)
    const path = `m/44'/${COIN_ID_FO}'/0'/0/${this.index}`
    this.path = path
    const child = node.derivePath(path)
    const pubkey = FIBOS.modules.ecc.privateToPublic(child.privateKey) // 公钥
    return pubkey
  }

  static import(mnemonic, pwd, name = '') {
    this.pwd = pwd
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const node = bip32.fromSeed(seed)
        const path = `m/44'/${COIN_ID_FO}'/0'/0/0`
        const child = node.derivePath(path)
        const pubkey = FIBOS.modules.ecc.privateToPublic(child.privateKey) // 公钥
        const address = pubkey
        const obj = {
          pubkey,
          address,
          name,
          pwd,
          alias: name,
          type: COIN_TYPE_FO,
          source: WALLET_SOURCE_MW,
        }

        const act = new FOWallet(obj)
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importPK(pk, pwd, name, alias) {
    return new Promise(async (resolve, reject) => {
      try {
        const address = FIBOS.modules.ecc.privateToPublic(pk)
        const obj = {
          id: CryptoJS.MD5(name).toString(),
          name,
          address,
          pwd,
          account: name,
          alias,
          // pwdnote: note,
          isBackup: true,
          pubkey: address,
          type: COIN_TYPE_FO,
          source: WALLET_SOURCE_PK,
        }
        const act = new FOWallet(obj)
        DeviceEventEmitter.emit('accountOnChange')
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static privateToPublic(pk) {
    return FIBOS.modules.ecc.privateToPublic(pk)
  }

  static importKS(ks, pwd, name, note) {}
  static backupMnemonic(mnemonic) {}
  drop = text => {}
  async isVaildPassword(pwd) {
    return true
  }
}
