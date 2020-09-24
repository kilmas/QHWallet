import { DeviceEventEmitter } from 'react-native'
import { observable, action, when } from 'mobx'
import { persist } from 'mobx-persist'
import CryptoJS from 'crypto-js'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import Wallet from './Wallet'
import { WALLET_SOURCE_PK, WALLET_SOURCE_MW, COIN_TYPE_TRX } from '../../config/const'
import _ from 'lodash'
import { TRX } from './Coin'
import TronWeb from '../../modules/tronweb'

const initPath = `m/44'/${COIN_TYPE_TRX}'/0'/0/0`

export default class TRXWallet extends Wallet {
  lastNonce = -1
  TRX = new TRX()

  @persist @observable index = '0'

  browserRecord = 'https://tronscan.io/#/address/'

  get defaultCoin() {
    return this.coins[0]
  }

  constructor(obj) {
    super(obj)
    if (obj) {
      if (obj.name) {
        this.coins = [this.TRX]
      }
    }
    when(
      () => !!this.address,
      () => {
        this.getBalanceTime()
      }
    )
  }

  getBalanceTime = async () => {
    await this.getBalance()
    setTimeout(() => {
      this.getBalanceTime()
    }, 30000)
  }

  @action
  getBalance = async () => {
    const { instance } = TronWeb
    if (this.address && instance) {
      let balance = 0
      try {
        balance = await instance.trx.getBalance(this.address)
        console.log(this.address, '- Output:', balance, '\n')
      } catch (e) {
        console.warn(e)
        return
      }
      if (this.coins[0]) {
        this.coins[0].balance = Number(balance)
      }
    }
  }

  static import(mnemonic, pwd, name = '') {
    return new Promise(async (resolve, reject) => {
      try {
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const node = bip32.fromSeed(seed)
        const path = initPath
        const child = node.derivePath(path)
        const { instance } = TronWeb
        const address = instance.address.fromPrivateKey(child.privateKey.toString('hex'))
        const obj = {
          id: CryptoJS.MD5(address).toString(),
          name,
          address,
          pwd,
          path,
          type: COIN_TYPE_TRX,
          source: WALLET_SOURCE_MW,
        }
        const act = new TRXWallet(obj)
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static importPK(pk, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const { instance } = TronWeb
        const address = instance.address.fromPrivateKey(pk)
        const act = new TRXWallet({
          id: CryptoJS.MD5(address).toString(),
          name,
          address,
          pwdnote: note,
          pwd,
          source: WALLET_SOURCE_PK,
          type: COIN_TYPE_TRX,
        })
        act.isBackup = true
        act.save()
        DeviceEventEmitter.emit('accountOnChange')
        resolve(act)
      } catch (error) {
        reject(error)
      }
    })
  }

  static getPrivateKeyFromMnemonic(mnemonic, path = initPath) {
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const node = bip32.fromSeed(seed)
    const child = node.derivePath(path)
    return child
  }
}
