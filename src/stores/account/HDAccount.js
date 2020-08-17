import { observable, computed, reaction, action } from "mobx";
import { persist } from 'mobx-persist'
import BTCWallet from "../wallet/BTCWallet";
import ETHWallet from "../wallet/ETHWallet";
import FOWallet from "../wallet/FOWallet";
import _ from "lodash";
import { toFixedNumber } from "../../utils/NumberUtil";
import Wallet from "../wallet/Wallet";
import Account from "./Account";
import {
  ACCOUNT_TYPE_HD,
  ACCOUNT_TYPE_HD_IMPORT,
  ACCOUNT_DEFAULT_ID_HD,
  HDACCOUNT_FIND_WALELT_TYPE_ID,
  HDACCOUNT_FIND_WALELT_TYPE_ADDRESS,
  HDACCOUNT_FIND_WALELT_TYPE_COINID,
} from "../../config/const";
import AccountStorage from "./AccountStorage";
import Coin from "../wallet/Coin";
import { mnemonicGenerate } from "../../utils/bip39Util";
import OKTWallet from "../wallet/OKTWallet";
// import { request } from "../../utils/request";

class HDAccount extends Account {
  @persist @observable hdId;
  @computed get hasCreated() {
    return !!this.wallets.length;
  }
  pwd;
  @persist @observable displayChange = true;
  @persist @observable hasBackup = false;

  @computed get lastTransferCoinID() {
    if (!this.stashedTransferCoinID) {
      return this.BTCWallet.BTC.id;
    }
    return this.stashedTransferCoinID;
  }

  @computed get lastReceiveCoinID() {
    if (!this.stashedReceiveCoinID) {
      return this.BTCWallet.BTC.id;
    }
    return this.stashedReceiveCoinID;
  }
  @computed get lastWalletID() {
    if (!this.stashedWalletID) {
      return this.BTCWallet.id;
    }
    return this.stashedWalletID;
  }

  /**
   *
   *
   * @memberof HDAccount
   */
  @persist @observable stashedTransferCoinID = null;
  @persist @observable stashedReceiveCoinID = null;

  @persist @observable stashedWalletID = null;
  /**
   *
   * @type { BTCWallet }
   * @memberof HDAccount
   */
  @persist('object', BTCWallet) @observable BTCWallet;
  /**
   *
   * @type { ETHWallet }
   * @memberof HDAccount
   */
  @persist('object', ETHWallet) @observable ETHWallet;

  /**
 *
 * @type { FOWallet }
 * @memberof HDAccount
 */
  @persist('object', FOWallet) @observable FOWallet;


  /**
 *
 * @type { OKTWallet }
 * @memberof HDAccount
 */
  @persist('object', OKTWallet) @observable OKTWallet;


  /**
   *
   * @type { Array.<Wallet> }
   * @memberof HDAccount
   */
  @computed get wallets() {
    return _.compact([this.BTCWallet, this.ETHWallet, this.FOWallet, this.OKTWallet])
  }

  @persist @observable isExtendedPublicKeyUploaded = false;

  @computed get needRecovery() {
    return this.hasCreated && !this.isExtendedPublicKeyUploaded;
  }

  @computed get totalAsset() {
    return toFixedNumber(
      this.wallets.reduce((sum, wallet) => sum + wallet.assetPrice, 0),
      2
    );
  }
  @computed get floatingAsset() {
    return toFixedNumber(
      this.wallets.reduce((sum, wallet) => sum + wallet.floatingAssetPrice, 0),
      2
    );
  }

  /**
   *
   * @type { Array.<Coin>}
   * @readonly
   * @memberof HDAccount
   */
  @computed get coins() {
    return this.allCoins.filter(coin => coin.display);
  }
  @computed get allCoins() {
    const ERC20s = this.ETHWallet && this.ETHWallet.coins.slice();
    ERC20s.shift();
    return _.compact([
      this.BTCWallet.BTC,
      this.BTCWallet.USDT,
      this.ETHWallet.ETH,
      this.FOWallet.FO,
      this.OKTWallet.OKT,
      ...ERC20s,
    ]);
  }
  @computed get addresss() {
    if (!this.BTCWallet) {
      return "";
    }
    return `[\"1,${this.ETHWallet.address}\",\"3,${this.BTCWallet.address}\",\"4,${this.ETHWallet.address}\"]`;
  }
  static create = async (name, pwd, mnemonicType) => {
    this.pwd = pwd;
    const mnemonics = await mnemonicGenerate();
    const account = await HDAccount.recovery(mnemonics, name, pwd);
    return { account, mnemonics };
  };
  static import = async (mnemonic, name, pwd) => {
    this.pwd = pwd;
    return await HDAccount.recovery(mnemonic, name, pwd, ACCOUNT_TYPE_HD_IMPORT, true);
  };
  static recovery = async (mnemonic, name, pwd, type = ACCOUNT_TYPE_HD, fetch = false) => {
    const mnemonicStr = _.isArray(mnemonic) ? mnemonic.join(" ") : mnemonic;

    const account = new HDAccount();
    account.BTCWallet = await BTCWallet.import(mnemonicStr, pwd, name, fetch);

    account.ETHWallet = await ETHWallet.import(mnemonicStr, pwd, name, fetch);

    account.FOWallet = await FOWallet.import(mnemonicStr, pwd, name, fetch);

    account.OKTWallet = await OKTWallet.import(mnemonicStr, pwd, name, fetch);

    const hdId = account.generateWalletID(mnemonicStr);

    account.hdId = hdId;
    account.type = ACCOUNT_TYPE_HD;
    account.isExtendedPublicKeyUploaded = true;
    account.id = hdId;

    if (fetch) {
      await account.update();
    }

    account.name = name;
    if (type === ACCOUNT_TYPE_HD_IMPORT) {
      account.hasBackup = true;
    }
    // AccountStore.currentAccount = account;
    // AccountStore.currentETHID = account.id;
    // AccountStore.showDefaultIndex = false;
    // AccountStorage.insert(account);
    AccountStorage.setDataByID(hdId, { type: 'HD', mnemonic: mnemonicStr }, pwd)

    // AccountStore.defaultMultiSigAccount.wallets = [];
    // AccountStore.defaultMultiSigAccount.pendingTxs = [];
    return account;
  };
  constructor(obj = {}) {
    super(obj);
    if (_.isPlainObject(obj.BTCWallet)) {
      this.BTCWallet = new BTCWallet(obj.BTCWallet);
    }
    if (_.isPlainObject(obj.ETHWallet)) {
      this.ETHWallet = new ETHWallet(obj.ETHWallet);
    }

    if (_.isPlainObject(obj.FOWallet)) {
      this.FOWallet = new FOWallet(obj.FOWallet);
    }

    if (obj.hasOwnProperty("hasBackup")) {
      this.hasBackup = obj.hasBackup;
    }
    // this.hdId = obj.hdId;
    // this.stashedTransferCoinID = obj.stashedTransferCoinID;
    // this.stashedReceiveCoinID = obj.stashedReceiveCoinID;
    // this.stashedWalletID = obj.stashedWalletID;
    // this.isExtendedPublicKeyUploaded = obj.isExtendedPublicKeyUploaded;
  }
  update = async () => {
    try {
      if (!this.hasCreated) {
        return;
      }
    } catch (error) {
      console.log(error)
    }
  };
  drop = async pwd => {
    if (!this.wallets.length) {
      throw new Error("请先创建钱包");
    }

    const result = await Promise.all(this.wallets.map(wallet => wallet.isVaildPassword(pwd)));
    const success = result.reduce((res, el) => res || el, false);

    if (success) {
      this.wallets.map(wallet => wallet.drop(pwd));
      // await AccountStorage.drop(this);
      // AccountStore.currentAccount = AccountStore.defaultHDAccount;
    }

    return success;
  };

  exportMnemonic = async pwd => {
    if (!this.wallets.length) {
      throw new Error("请先创建钱包");
    }
    const { mnemonic } = await AccountStorage.getDataByID(this.hdId, pwd)
    return mnemonic
  };

  @action
  checkFOAccount = async (pwd) => {
    const mnemonic = await this.exportMnemonic(pwd)
    if (this.FOWallet) {
      const privateKey = await this.FOWallet.autoCheckAccount(mnemonic)
      if (privateKey && this.FOWallet.id) {
        AccountStorage.setDataByID(this.FOWallet.id, { type: 'FO', privateKey }, pwd)
      }
    }
  }

  /**
   *
   * @returns {Wallet}
   * @memberof HDAccount
   */
  findWallet = (id, type = HDACCOUNT_FIND_WALELT_TYPE_ID | HDACCOUNT_FIND_WALELT_TYPE_ADDRESS) => {
    if (!_.isString(id) && !_.isNumber(id)) {
      return null;
    }

    let wallet;
    id = (`${id}`).toUpperCase();
    if (type & HDACCOUNT_FIND_WALELT_TYPE_ID) {
      wallet = this.wallets.find(
        wallet => (wallet.id && wallet.id.toUpperCase() === id) || wallet.address.toUpperCase() === id
      );
      if (wallet) {
        return wallet;
      }
    }

    if (type & HDACCOUNT_FIND_WALELT_TYPE_ADDRESS) {
      wallet = this.wallets.find(wallet => wallet.address === id);
      if (wallet) {
        return wallet;
      }
    }

    if (type & HDACCOUNT_FIND_WALELT_TYPE_COINID) {
      wallet = this.wallets.find(wallet => !!wallet.coins.find(coin => `${coin.id}` === id));
      if (wallet) {
        return wallet;
      }
    }

    return wallet;
  };

  /**
   *
   * @returns {Coin}
   * @memberof HDAccount
   */
  findCoin = coinID => {
    if (_.isNil(coinID)) {
      return null;
    }
    return this.coins.find(coin => `${coin.id}` === `${coinID}`);
  };
}
export default HDAccount;
