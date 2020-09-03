import { observable, action, toJS, reaction } from "mobx";
import { persist } from 'mobx-persist'
import _ from "lodash";
import Engine from "../modules/metamask/core/Engine";
import { renderFromWei } from "../utils/number";

export default class EngineStore {

  @persist('object') @observable backgroundState = {}

  @action
  updateBGstate(key) {
    this.backgroundState[key] = Engine.state[key]
    if (key === 'AccountTrackerController') {
      if (this.accountStore) {
        const accounts = _.get(Engine.state[key], 'accounts')
        this.accountStore.ETHAccounts.forEach(account=> {
          const selectedAddress = account.ETHWallet && account.ETHWallet.address
          if (accounts[selectedAddress]) {
            const balance = renderFromWei(accounts[selectedAddress].balance)
            account.ETHWallet.setBalance(balance)
          }
        })
      }
    }
  }

  accountStore = null

  setAccountStore (accountStore) {
    this.accountStore = accountStore
  }

  @action
  initBGstate() {
    [
      'AccountTrackerController',
      'AddressBookController',
      'AssetsContractController',
      'AssetsController',
      'AssetsDetectionController',
      'CurrencyRateController',
      'KeyringController',
      'NetworkController',
      'NetworkStatusController',
      'PersonalMessageManager',
      'PhishingController',
      'PreferencesController',
      'TokenBalancesController',
      'TokenRatesController',
      'TransactionController',
      'TypedMessageManager',
    ].forEach(key=>{
      if (!this.backgroundState[key]) {
        this.backgroundState[key] = Engine.state[key]
      }
    })
  }

  @action importMetamask = async (mnemonic, password, reset = true) => {
    const { KeyringController } = Engine.context;
    if (reset) {
      await Engine.resetState();
    }
    return await KeyringController.createNewVaultAndRestore(password, mnemonic);
  }
  
  @action importAccountFromPrivateKey = async (private_key) => {
    const { KeyringController } = Engine.context;
    // Import private key
    let pkey = private_key;
    // Handle PKeys with 0x
    if (pkey.length === 66 && pkey.substr(0, 2) === '0x') {
      pkey = pkey.substr(2);
    }
    const res = await KeyringController.importAccountWithStrategy('privateKey', [private_key]);
  }
}