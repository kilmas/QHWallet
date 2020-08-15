import _ from 'lodash'
import { observable, computed, action, reaction } from 'mobx'
import { persist } from 'mobx-persist'
import AsyncStorage from '@react-native-community/async-storage'
import { crypto } from '@okchain/javascript-sdk'
import {
  ACCOUNT_TYPE_HD,
  ACCOUNT_TYPE_MULTISIG,
  ACCOUNT_TYPE_COMMON,
  // ACCOUNT_TYPE_HD_IMPORT,
  // ACCOUNT_DEFAULT_ID_HD,
  // ACCOUNT_DEFAULT_ID_MULTISIG,
  NETWORK_ENV_MAINNET,
} from '../config/const'
import Account from './account/Account'
import network from '../modules/common/network'
import HDAccount from './account/HDAccount'
import CoinStore from './wallet/CoinStore'
import AccountStorage from './account/AccountStorage'
import CommonAccount from './account/CommonAccount'
import MultiSigAccount from './account/MultiSigAccount'
import Ironman from '../modules/ironman'
import SecureKeychain from '../modules/metamask/core/SecureKeychain'
import OKClient from '../modules/okchain'

class AccountStore {
  @persist @observable isHiddenPrice = false
  @observable showDefaultIndex = true

  @observable isInit = false
  
  @persist @observable currentAccountID = null
  /**
   *
   * @type { Account }
   * @memberof AccountStore
   */
  @observable currentAccount = null

  @persist @observable currentFOID = null

  @persist @observable currentETHID = null

  @persist @observable currentBTCID = null

  @persist @observable currentOKTID = null

  /**
   *
   * @readonly
   * @type { HDAccount }
   * @memberof AccountStore
   */
  @computed get defaultHDAccount() {
    if (this.HDAccounts.length) {
      return this.HDAccounts[0]
    }
    return undefined
  }

  /**
   *
   * @readonly
   * @type { MultiSigAccount }
   * @memberof AccountStore
   */
  @computed get defaultMultiSigAccount() {
    return this.accounts.find(account => account.type === ACCOUNT_TYPE_MULTISIG)
  }
  /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get accounts() {
    return _.compact([...this.HDAccounts, ...this.CommonAccounts])
  }

  @persist('list', HDAccount) @observable HDAccounts = []

  @persist('list', CommonAccount) @observable CommonAccounts = []

  /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get FOAccounts() {
    // let currentFO
    // const CommonFO = this.CommonAccounts.filter(item => {
    //   if (item.id === this.currentFOID) {
    //     currentFO = item
    //     return false
    //   }
    //   if (item.walletType === 'FO') {
    //     return true
    //   }
    //   return false
    // })
    // const HDFO = this.HDAccounts.filter(item => {
    //   if (item.id === this.currentFOID) {
    //     currentFO = item
    //     return false
    //   }
    //   if (item.FOWallet.hasCreated) {
    //     return true
    //   }
    //   return false
    // })
    const CommonFO = this.CommonAccounts.filter(item => item.walletType === 'FO')
    return _.compact([...this.HDAccounts, ...CommonFO])
    // return _.compact([currentFO, ...HDFO, ...CommonFO])
  }

  /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get OKTAccounts() {
    // let currentOKT
    // const CommonOKT = this.CommonAccounts.filter(item => {
    //   // if (item.id === this.currentOKTID) {
    //   //   currentOKT = item
    //   //   return false
    //   // }
    //   if (item.walletType === 'OKT') {
    //     return true
    //   }
    //   return false
    // })
    // const HDOKT = this.HDAccounts.filter(item => {
    //   if (item.id === this.currentOKTID) {
    //     currentOKT = item
    //     return false
    //   }
    //   return true
    // })
    const CommonOKT = this.CommonAccounts.filter(item => item.walletType === 'OKT')
    return _.compact([...this.HDAccounts, ...CommonOKT])
  }


    /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get ETHAccounts() {
    const CommonOKT = this.CommonAccounts.filter(item => item.walletType === 'ETH')
    return _.compact([...this.HDAccounts, ...CommonOKT])
  }

  constructor() {
    reaction(
      () => this.currentOKTID,
      currentOKTID => {
        this.setOKClient()
      }
    )

    reaction(
      () => this.currentAccountID,
      currentAccountID => {
        this.currentAccount = this.match(this.currentAccountID)
        if (!this.currentETHID) {
          this.currentETHID = currentAccountID
        }
        if (!this.currentFOID) {
          this.currentFOID = currentAccountID
        }
        if (!this.currentOKTID) {
          this.currentOKTID = currentAccountID
        }
      }
    )

    reaction(
      () => this.currentFOID,
      currentFOID => {
        this.setIronman()
      }
    )
  }

  @action
  init = env => {
    try {
      // network.setRPCURLs()
      // network.fetchRPCURLs()
      // CoinStore.start()
      // if (!this.defaultMultiSigAccount) {
      //   const multiSig = new MultiSigAccount({
      //     id: ACCOUNT_DEFAULT_ID_MULTISIG,
      //     name: "多签钱包",
      //     type: ACCOUNT_TYPE_MULTISIG,
      //   });
      //   this.accounts.splice(2, 0, multiSig);
      // }
      // if (this.accounts.find(account => !!account.hasCreated)) {
      //   this.showDefaultIndex = false
      // }

      if (this.currentAccountID && !this.currentAccount) {
        console.log('testest')
        this.currentAccount = this.match(this.currentAccountID)
      }

      // this.HDAccounts.observe(this.onAccountsChange);
      // this.CommonAccounts.observe(this.onAccountsChange);
    } catch (error) {
      console.error(error)
      alert(error)
    }
    this.isInit = true
  }

  setIronman = async () => {
    const keychain = await SecureKeychain.getGenericPassword()
    if (keychain && this.FOAccounts.length) {
      const { privateKey } = await AccountStorage.getDataByID(this.currentFOID, keychain.password)
      Ironman.init({
        chainId: '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a',
        keyProvider: privateKey,
        httpEndpoint: 'https://to-rpc.fibos.io',
        logger: {
          log: null,
          error: null,
        },
      })
    }
  }

  setOKClient = async () => {
    const keychain = await SecureKeychain.getGenericPassword()
    if (keychain && this.OKTAccounts.length) {
      const keyObj = await AccountStorage.getDataByID(this.currentOKTID, keychain.password)
      let privateKey
      if (keyObj.type === 'HD') {
        privateKey = crypto.getPrivateKeyFromMnemonic(keyObj.mnemonic)
      } else if (keyObj.type === 'OKT') {
        privateKey = keyObj.privateKey
      } else {
        console.warn('error')
        return
      }
      OKClient.init({
        privateKey,
      })
    }
  }

  @action
  insert = account => {
    if (this.match(account.id)) {
      return
    }
    if (account.type === ACCOUNT_TYPE_HD) {
      this.HDAccounts = [...this.HDAccounts, account]
      this.currentAccount = account
      this.showDefaultIndex = false
      this.currentAccountID = account.id
      // this.defaultMultiSigAccount.wallets = [];
      // this.defaultMultiSigAccount.pendingTxs = [];
    } else if (account.type === ACCOUNT_TYPE_COMMON) {
      this.CommonAccounts.push(account)
      switch (account.walletType) {
        case 'FO':
          this.currentFOID = account.id
          break
        case 'BTC':
          this.currentBTCID = account.id
          break
        case 'ETH':
          this.currentETHID = account.id
          break
        case 'OKT':
          this.currentOKTID = account.id
          break
        default:
          console.log('walletType fail')
          return
      }
    }
    AccountStorage.insert(account)
  }

  @action
  drop = async acc => {
    if (acc.type === ACCOUNT_TYPE_HD) {
      this.HDAccounts = this.HDAccounts.filter(account => account.id !== acc.id)
    } else if (acc.type === ACCOUNT_TYPE_COMMON) {
      this.CommonAccounts = this.CommonAccounts.filter(account => account.id !== acc.id)
    }
    // await AccountStorage.drop({
    //   id: acc.id,
    //   type: acc.type
    // })
    return true
  }

  @action setCurrentID = currentID => {
    this.currentAccountID = currentID
  }

  @action setCurrentFOID = currentFOID => {
    this.currentFOID = currentFOID
  }

  @action setCurrentOKTID = currentOKTID => {
    this.currentOKTID = currentOKTID
  }

  @action setHiddenPrice = isHiddenPrice => {
    this.isHiddenPrice = isHiddenPrice
  }

  onAccountsChange = () => {
    return
  }

  /**
   * @type {Account}
   *
   * @memberof AccountStore
   */
  match = id => {
    if (!_.isString(id)) {
      return null
    }

    let account = this.HDAccounts.find(hdaccount => hdaccount.id === id)
    if (account) {
      return account
    }

    account = this.CommonAccounts.find(cmaccount => cmaccount.id === id)
    if (account) {
      return account
    }
    return account

    // account = this.accounts.find(account => `${account.id}`.toUpperCase() === id.toUpperCase())
    // if (account) {
    //   return account
    // }
  }
}

export default AccountStore
