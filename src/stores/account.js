import _ from "lodash";
import { observable, computed, action, reaction } from "mobx";
import { persist, create } from 'mobx-persist'
import AsyncStorage from "@react-native-community/async-storage";
import {
  ACCOUNT_TYPE_HD,
  ACCOUNT_TYPE_HD_IMPORT,
  ACCOUNT_DEFAULT_ID_HD,
  ACCOUNT_TYPE_MULTISIG,
  ACCOUNT_TYPE_COMMON,
  ACCOUNT_DEFAULT_ID_MULTISIG,
  NETWORK_ENV_MAINNET, } from "../config/const";
import Account from "./account/Account";
import network from "../modules/common/network";
import HDAccount from "./account/HDAccount";
import CoinStore from "./wallet/CoinStore";
import AccountStorage from "./account/AccountStorage";
import CommonAccount from "./account/CommonAccount";
import MultiSigAccount from "./account/MultiSigAccount";
import Ironman from "../modules/ironman";
import SecureKeychain from "../modules/metamask/core/SecureKeychain";
import OKClient from "../modules/okchain";

class AccountStore {
  @persist @observable isHiddenPrice = false;
  @observable showDefaultIndex = true;

  /**
 *
 * @type { Account }
 * @memberof AccountStore
 */
  @persist @observable currentAccountID = null;
  /**
   *
   * @type { Account }
   * @memberof AccountStore
   */
  @observable currentAccount = null;


  /**
 *
 * @type { Account }
 * @memberof AccountStore
 */
  @persist @observable currentFOID = null;


  /**
   *
   * @type { Account }
   * @memberof AccountStore
   */
  @persist @observable currentETHID = null;

  /**
   *
   * @type { Account }
   * @memberof AccountStore
   */
  @persist @observable currentBTCID = null;


    /**
   *
   * @type { Account }
   * @memberof AccountStore
   */
  @persist @observable currentOKTID = null;

  /**
   *
   * @readonly
   * @type { HDAccount }
   * @memberof AccountStore
   */
  @computed get defaultHDAccount() {
    return this.HDAccounts[0];
  }

  /**
   *
   * @readonly
   * @type { MultiSigAccount }
   * @memberof AccountStore
   */
  @computed get defaultMultiSigAccount() {
    return this.accounts.find(account => account.type === ACCOUNT_TYPE_MULTISIG);
  }
  /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get accounts() {
    return _.compact([...this.HDAccounts, ...this.CommonAccounts]);
  }

  @persist('list', HDAccount) @observable HDAccounts = [];

  @persist('list', CommonAccount) @observable CommonAccounts = [];

    /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get FOAccounts() {
    let currentFO
    const CommonFO = this.CommonAccounts.filter(item=>{
      if (item.id === this.currentFOID) {
        currentFO = item
        return false
      }
      if (item.walletType === 'FO') {
        return true
      }
      return false
    })
    const HDFO = this.HDAccounts.filter(item=>{
      if (item.id === this.currentFOID) {
        currentFO = item
        return false
      }
      if (item.FOWallet.hasCreated) {
        return true
      }
      return false
    })
    return _.compact([currentFO, ...HDFO, ...CommonFO]);
  }


      /**
   *
   * @type { Array.<Account> }
   * @memberof AccountStore
   */
  @computed get OKTAccounts() {
    let currentOKT
    const CommonOKT = this.CommonAccounts.filter(item=>{
      if (item.id === this.currentOKTID) {
        currentOKT = item
        return false
      }
      if (item.walletType === 'OKT') {
        return true
      }
      return false
    })
    const HDOKT = this.HDAccounts.filter(item=>{
      if (item.id === this.currentOKTID) {
        currentOKT = item
        return false
      }
      return true
    })
    return _.compact([currentOKT, ...HDOKT, ...CommonOKT]);
  }

  @action
  init = async env => {
    try {
      network.setRPCURLs();
      network.fetchRPCURLs();
      await CoinStore.start();
      if (!this.defaultMultiSigAccount) {
        // const multiSig = new MultiSigAccount({
        //   id: ACCOUNT_DEFAULT_ID_MULTISIG,
        //   name: "多签钱包",
        //   type: ACCOUNT_TYPE_MULTISIG,
        // });
        // this.accounts.splice(2, 0, multiSig);
      }
      if (this.accounts.find(account => !!account.hasCreated)) {
        this.showDefaultIndex = false;
      }

      if (this.currentAccountID) {
        this.currentAccount = this.match(this.currentAccountID);
        if (!this.currentETHID) {
          this.currentETHID = this.currentAccountID
        }
        if (!this.currentFOID) {
          this.currentFOID = this.currentAccountID
        }
      }

      if (this.defaultHDAccount && this.defaultHDAccount.hasCreated) {
        this.currentAccount = this.defaultHDAccount;
      }

      if (!this.currentAccount) {
        this.currentAccount = this.accounts.length > 0 && this.accounts[0];
      }

      const keychain = await SecureKeychain.getGenericPassword()
      if (keychain && this.FOAccounts.length) {
        const { privateKey } = await AccountStorage.getDataByID(this.currentFOID, keychain.password)
        Ironman.init({
          chainId: "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a",
          keyProvider: privateKey,
          httpEndpoint: "https://to-rpc.fibos.io",
          logger: {
            log: null,
            error: null
          }
        })
      }
      this.setOKClient()
      // this.HDAccounts.observe(this.onAccountsChange);
      // this.CommonAccounts.observe(this.onAccountsChange);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  setOKClient = async () => {
    const keychain = await SecureKeychain.getGenericPassword()
    if (keychain && this.OKTAccounts.length) {
      const currentOKT =  this.OKTAccounts[0]
      const keyObj = await AccountStorage.getDataByID(currentOKT.hdId, keychain.password)

      if (keyObj.type === 'HD') {
        const privateKey = currentOKT.OKTWallet.exportPKByMnemonic(keyObj.mnemonic)
        OKClient.init({
          privateKey: privateKey,
        })
      }

    }
  }

  @action 
  insert = (account) => {
    if (this.match(account.id)) {
      return 
    }
    if (account.type === ACCOUNT_TYPE_HD) {
      this.HDAccounts = [
        ... this.HDAccounts,
        account,
      ]
      this.currentAccount = account;
      this.currentETHID = account.id;
      this.showDefaultIndex = false;
      this.currentAccountID = account.id 
      // this.defaultMultiSigAccount.wallets = [];
      // this.defaultMultiSigAccount.pendingTxs = [];
    } else if (account.type === ACCOUNT_TYPE_COMMON) {
      this.CommonAccounts.push(account)
      switch (account.walletType) {
        case 'FO':
          this.currentFOID = account.id;
          break;
        case 'BTC':
          this.currentBTCID = account.id;
          break;
        case 'ETH':
          this.currentETHID = account.id;
          break;
        default:
          console.log('walletType fail')
          return
      }
    }
    AccountStorage.insert(account)
  }

  @action 
  drop = async id => {
    if (account.type === ACCOUNT_TYPE_HD) {
      this.HDAccounts = this.HDAccounts.filter(account => account.id === id)
    } else if (account.type === ACCOUNT_TYPE_COMMON) {
      this.CommonAccounts = this.CommonAccounts.filter(account => account.id === id)
    }
    await AccountStorage.drop({
      id: account.id,
      type: account.type
    })
  };

  @action setCurrentFOID = (currentFOID) => {
    this.currentFOID = currentFOID
  }
  @action setHiddenPrice = (isHiddenPrice) => {
    this.isHiddenPrice = isHiddenPrice
  }
  onAccountsChange = change => {
    return;
  };

  /**
   * @type {Account}
   *
   * @memberof AccountStore
   */
  match = id => {
    if (!_.isString(id)) {
      return null;
    }

    let account = this.accounts.find(account => `${account.id}`.toUpperCase() === id.toUpperCase());
    if (account) {
      return account;
    }

    account = this.HDAccounts.find(hdaccount => !!hdaccount.findWallet(id));
    return account;
  };
}

const hydrate = create({ storage: AsyncStorage, jsonify: true })

const accountStore = new AccountStore();
hydrate('accounts', accountStore).then(async (store) => {
  store.init(NETWORK_ENV_MAINNET)
  console.log('accounts has been hydrated')
});

export default accountStore;
