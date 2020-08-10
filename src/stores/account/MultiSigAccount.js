import { observable, computed, reaction, action } from "mobx";
import Account from "./Account";
import AccountStorage from "./AccountStorage";
import MultiSigWallet, {
  MultiSigTransaction,
} from "../wallet/MultiSigWallet";
import _ from "lodash";
import { toFixedNumber } from "../../utils/NumberUtil";
// import BTCMultiSigWallet from "../../modules/wallet/wallet/btc/BTCMultiSigWallet";

class MultiSigAccount extends Account {

  accountStore;
  @observable displayChange = true;

  @computed get hasCreated() {
    return !!this.wallets.length;
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
   * @type {Array.<MultiSigWallet>}
   * @memberof MultiSigAccount
   */
  @observable wallets = [];
  /**
   *
   * @type {Array.<MultiSigTransaction>}
   * @memberof MultiSigAccount
   */
  @observable pendingTxs = [];

  @observable frozenUtxos = [];

  @computed get completedWallets() {
    return this.wallets.filter(wallet => wallet.isCompleted);
  }

  @computed get incompletedWallets() {
    return this.wallets.filter(wallet => !wallet.isCompleted);
  }

  constructor(obj = {}) {
    const { wallets } = obj;
    super(obj);
    // this.wallets = (wallets && wallets.map(wallet => new BTCMultiSigWallet(wallet))) || [];
    reaction(
      () => this.wallets.length,
      length => {
        AccountStorage.update();
      }
    );
  }
  @action update = async () => {
    try {
     
    } catch (error) {}
  };
  @action syncPendingTx = async () => {};

  @action syncAddress = async () => {};
  findWallet = id => this.wallets.find(wallet => wallet.id == id);
  findCoin = (coinID, walletID) => {
    const wallet = this.findWallet(walletID);
    return wallet && wallet.findCoin(coinID);
  };
  @action calculateBalance = () => {}
}

export default MultiSigAccount;
