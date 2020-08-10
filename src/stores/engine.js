import { observable, action, toJS, reaction } from "mobx";
import { persist } from 'mobx-persist'
import _ from "lodash";
import Engine from "../modules/metamask/core/Engine";

export default class EngineStore {

  @persist('object') @observable backgroundState = {}

  @action
  updateBGstate(key) {
    this.backgroundState[key] = Engine.state[key]
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

  @action importMetamask = async (password, mnemonic) => {
    const { KeyringController } = Engine.context;
    await Engine.resetState();
    return await KeyringController.createNewVaultAndRestore(password, mnemonic);
  }
}