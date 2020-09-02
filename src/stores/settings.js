import { action, observable } from 'mobx';
import { persist } from 'mobx-persist'
import AppConstants from '../modules/metamask/core/AppConstants';

export default class Store {

  @persist @observable searchEngine = AppConstants.DEFAULT_SEARCH_ENGINE;
  @persist @observable primaryCurrency = 'ETH';
  @persist @observable lockTime = -1; // Disabled by default
  @persist @observable paymentChannelsEnabled = false


  @persist @observable initialRouteName = null

  @persist('object') @observable language = {
    name: '简体中文',
    locale: 'zh',
  };
  @persist('object') @observable currency = {
    name: 'USD',
    unit: '$',
  };

  @persist @observable passwordSet = false

  @observable username = '';
  @observable email = '';
  @observable exchangeRate = 1;

  @action
  setInitialRouteName = (initialRouteName = "Wallet") => {
    this.initialRouteName = initialRouteName;
  };

  @persist('list') @observable contacts = [];

  @persist @observable fibosNetwork = 1;

  @action
  setFibosNetwork = network => {
    this.fibosNetwork = network;
  };

  @action
  setContacts = contact => {
    this.contacts = contact;
  };

  @action
  addContacts = async contact => {
    let temp = this.contacts;
    temp.push(contact);
    this.contacts = temp;
  };

  @action
  removeContacts = async index => {
    let temp = this.contacts;
    temp.splice(index, 1);
    this.contacts = temp;
  };

  @action
  setLanguage = language => {
    this.language = language;
  };

  @action
  setLockTime = (value) => {
    this.lockTime = value
  }

  @action
  setPassword = () => {
    this.passwordSet = true
  }
}