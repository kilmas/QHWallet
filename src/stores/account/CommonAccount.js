import { observable, computed, action, when } from 'mobx'
import { persist } from 'mobx-persist'
import BTCWallet from '../wallet/BTCWallet'
import ETHWallet from '../wallet/ETHWallet'
import FOWallet from '../wallet/FOWallet'
import _ from 'lodash'
import { toFixedNumber } from '../../utils/NumberUtil'
import Wallet from '../wallet/Wallet'
import Account from './Account'
import AccountStorage from './AccountStorage'
import Coin from '../wallet/Coin'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import { HDACCOUNT_FIND_WALELT_TYPE_ID, HDACCOUNT_FIND_WALELT_TYPE_ADDRESS, HDACCOUNT_FIND_WALELT_TYPE_COINID, ACCOUNT_TYPE_COMMON, COIN_TYPE_EOS, COIN_TYPE_FO } from '../../config/const'
import OKTWallet from '../wallet/OKTWallet'
import EOSWallet from '../wallet/EOSWallet'

class CommonAccount extends Account {
  @computed get hasCreated() {
    return !!this.wallets.length
  }
  pwd
  @persist @observable walletType
  @persist @observable displayChange = true
  @persist @observable hasBackup = false

  @computed get lastTransferCoinID() {
    if (!this.stashedTransferCoinID) {
      return this.BTCWallet.BTC.id
    }
    return this.stashedTransferCoinID
  }

  @computed get lastReceiveCoinID() {
    if (!this.stashedReceiveCoinID) {
      return this.BTCWallet.BTC.id
    }
    return this.stashedReceiveCoinID
  }
  @computed get lastWalletID() {
    if (!this.stashedWalletID) {
      return this.BTCWallet.id
    }
    return this.stashedWalletID
  }

  /**
   *
   *
   * @memberof CommonAccount
   */
  @persist @observable stashedTransferCoinID = undefined
  @persist @observable stashedReceiveCoinID = undefined

  @persist @observable stashedWalletID = undefined
  /**
   *
   * @type { BTCWallet }
   * @memberof CommonAccount
   */
  @persist('object', BTCWallet) @observable BTCWallet
  /**
   *
   * @type { ETHWallet }
   * @memberof CommonAccount
   */
  @persist('object', ETHWallet) @observable ETHWallet

  /**
   *
   * @type { FOWallet }
   * @memberof CommonAccount
   */
  @persist('object', FOWallet) @observable FOWallet

  /**
   *
   * @type { EOSWallet }
   * @memberof CommonAccount
   */
  @persist('object', EOSWallet) @observable EOSWallet

  /**
   *
   * @type { OKTWallet }
   * @memberof CommonAccount
   */
  @persist('object', OKTWallet) @observable OKTWallet

  /**
   *
   * @type { Array.<Wallet> }
   * @memberof CommonAccount
   */
  @computed get wallets() {
    return _.compact([this.FOWallet, this.BTCWallet, this.ETHWallet, this.OKTWallet, this.EOSWallet])
  }

  @computed get totalAsset() {
    return toFixedNumber(this.wallets.reduce((sum, wallet) => sum + wallet.assetPrice, 0), 2)
  }

  @computed get floatingAsset() {
    return toFixedNumber(this.wallets.reduce((sum, wallet) => sum + wallet.floatingAssetPrice, 0), 2)
  }

  /**
   *
   * @type { Array.<Coin>}
   * @readonly
   * @memberof CommonAccount
   */
  @computed get coins() {
    return this.allCoins.filter(coin => coin.display)
  }
  @computed get allCoins() {
    if (this.walletType === 'BTC') {
      return this.BTCWallet && this.BTCWallet.coins
    } else if (this.walletType === 'ETH') {
      const ERC20s = this.ETHWallet && this.ETHWallet.coins.slice()
      ERC20s && ERC20s.shift()
      return _.compact([this.ETHWallet && this.ETHWallet.defaultCoin, ...ERC20s])
    } else if (this.walletType === 'FO') {
      return _.compact([this.FOWallet && this.FOWallet.defaultCoin])
    } else if (this.walletType === 'OKT') {
      return _.compact([this.OKTWallet && this.OKTWallet.defaultCoin])
    } else if (this.walletType === 'EOS') {
      return _.compact([this.EOSWallet && this.EOSWallet.defaultCoin])
    }
    return []
  }

  static import = async (pk, walletType, name, pwd, alias) => {
    if (!pwd) {
      try {
        const password = SecureKeychain.getInstance().getPassword()
        if (!password) return
        pwd = password
      } catch (error) {
        console.error(error)
        return
      }
    }
    return await CommonAccount.recovery(pk, name, pwd, walletType, alias)
  }
  static recovery = async (pk, name, pwd, walletType = 'FO', alias) => {
    const account = new CommonAccount()
    account.id = account.generateWalletID(pk)
    switch (walletType) {
      case 'FO':
        account.FOWallet = await FOWallet.importPK(pk, pwd, name, alias)
        break
      case 'BTC':
        account.BTCWallet = await BTCWallet.importPK(pk, pwd, name)
        break
      case 'ETH':
        account.ETHWallet = await ETHWallet.importPK(pk, pwd, name)
        break
      case 'OKT':
        account.OKTWallet = await OKTWallet.importPK(pk, pwd, name)
        break
      case 'EOS':
        account.EOSWallet = await EOSWallet.importPK(pk, pwd, name, alias)
        break
      default:
        return null
    }
    account.type = ACCOUNT_TYPE_COMMON
    account.walletType = walletType
    account.name = name
    account.hasBackup = true
    AccountStorage.setDataByID(account.id, { type: walletType, privateKey: pk }, pwd)

    return account
  }

  exportPrivateKey = async pwd => {
    const data = await AccountStorage.getDataByID(this.id, pwd)
    return data
  }

  constructor(obj = {}) {
    super(obj)
    when(
      () => !!this.BTCWallet,
      () => {
        this.BTCWallet.pAccount = this
      }
    )
  }
  update = async () => {
    try {
      if (!this.hasCreated) {
        return
      }
      // AccountStorage.update();
    } catch (error) {
      console.log(error)
    }
  }
  drop = async pwd => {
    if (!this.wallets.length) {
      throw new Error('请先创建钱包')
    }

    const result = await Promise.all(this.wallets.map(wallet => wallet.isVaildPassword(pwd)))
    const success = result.reduce((res, el) => res || el, false)

    if (success) {
      this.wallets.map(wallet => wallet.drop(pwd))
      await AccountStorage.drop(this)
      // AccountStore.currentAccount = AccountStore.defaultHDAccount;
    }

    return success
  }

  /**
   *
   * @returns {Wallet}
   * @memberof CommonAccount
   */
  findWallet = (id, type = HDACCOUNT_FIND_WALELT_TYPE_ID | HDACCOUNT_FIND_WALELT_TYPE_ADDRESS) => {
    if (!_.isString(id) && !_.isNumber(id)) {
      return null
    }

    let wallet
    id = `${id}`.toUpperCase()
    if (type & HDACCOUNT_FIND_WALELT_TYPE_ID) {
      wallet = this.wallets.find(wallet => (wallet.id && wallet.id.toUpperCase() === id) || wallet.address.toUpperCase() === id)
      if (wallet) {
        return wallet
      }
    }

    if (type & HDACCOUNT_FIND_WALELT_TYPE_ADDRESS) {
      wallet = this.wallets.find(wallet => wallet.address === id)
      if (wallet) {
        return wallet
      }
    }

    if (type & HDACCOUNT_FIND_WALELT_TYPE_COINID) {
      wallet = this.wallets.find(wallet => !!wallet.coins.find(coin => coin.id + '' === id))
      if (wallet) {
        return wallet
      }
    }

    return wallet
  }

  @action
  changeName (name) {
    if (this.walletType !== 'EOS' && this.walletType !== 'FO') {
      this.name = name
    }
    this.wallets.forEach(wallet => {
      if(wallet.type === COIN_TYPE_FO || wallet.type === COIN_TYPE_EOS) {
        wallet.alias = name
      } else {
        wallet.name = name
      }
    })
  }

  /**
   *
   * @returns {Coin}
   * @memberof CommonAccount
   */
  findCoin = coinID => {
    if (_.isNil(coinID)) {
      return null
    }
    return this.coins.find(coin => coin.id === coinID)
  }
}

export default CommonAccount
