import { observable } from 'mobx'
import AsyncStorage from '@react-native-community/async-storage'
import { create } from 'mobx-persist'
import WalletStore from './wallet'
import price from './price'
import common from './common'
import Transaction from './transaction'
import Wizard from './wizard'
import Bookmarks from './bookmarks'
import Browser from './browser'
import Privacy from './privacy'
import AccountStore from './account'

import EngineStore from './engine'
import SettingStore from './settings'
import Modals from './modals'
import MetaMask from '../modules/metamask'
import { NETWORK_ENV_MAINNET } from '../config/const'
import { setLocale } from '../locales/i18n'

const hydrate = create({ storage: AsyncStorage, jsonify: true })

const settingStore = new SettingStore();
hydrate('settingStore', settingStore).then((store) => {
  if (!store.initialRouteName)
    store.setInitialRouteName()
  if (store.language && store.language.locale) {
    setLocale(store.language.locale)
  }
  // console.log('settingStore has been hydrated')
});

const accountStore = new AccountStore()
hydrate('accounts', accountStore).then(store => {
  store.init(NETWORK_ENV_MAINNET)
  // console.log('accounts has been hydrated')
})

const walletStore = new WalletStore();
hydrate('walletStore', walletStore).then(() => {
  // console.log('walletStore has been hydrated')
});

const engineStore = new EngineStore();
hydrate('engineStore', engineStore).then((store) => {
  MetaMask.initalizeEngine(store);
  setTimeout(() => {
    store.initBGstate()
  }, 3000)
  // console.log('engineStore has been hydrated')
});

const privacyStore = new Privacy();
hydrate('privacyStore', privacyStore).then(() => {
  // console.log('privacyStore has been hydrated')
});

const bookmarksStore = new Bookmarks();
hydrate('bookmarksStore', bookmarksStore).then(() => {
  // console.log('bookmarksStore has been hydrated')
});

const wizardStore = new Wizard();
hydrate('wizardStore', wizardStore).then(() => {
  // console.log('wizardStore has been hydrated')
});

const transactionStore = new Transaction();
hydrate('transactionStore', transactionStore).then(() => {
  // console.log('transactionStore has been hydrated')
});

const browserStore = new Browser();
hydrate('borwserStore', browserStore).then(() => {
  // console.log('borwserStore has been hydrated')
});

const modalsStore = new Modals()
hydrate('modalsStore', modalsStore).then(() => {
  // console.log('modalsStore has been hydrated')
});

const rootStore = observable({
  settings: settingStore,
  accountStore,
  wallet: walletStore,
  price,
  common,
  engine: engineStore,
  transaction: transactionStore,
  wizard: wizardStore,
  bookmarks: bookmarksStore,
  browser: browserStore,
  privacy: privacyStore,
  modals: modalsStore,
})


export default rootStore;