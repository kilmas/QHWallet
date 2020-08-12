import { action, observable } from 'mobx';
import { persist } from 'mobx-persist'

export default class Browser {

  @persist('list') @observable history = []
  @persist('list') @observable whitelist = []
  @persist('list') @observable tabs = []
  @persist @observable activeTab = null

  @action
  addToWhitelist = url => {
    this.whitelist.push(url)
  };

  @action
  addToHistory = ({ url, name }) => {
    this.history.push({ url, name })
  }

  @action
  createNewTab = (url, id = Date.now()) => {
    const tab = { url, id }
    this.tabs.push(tab)
    return tab
  }

  @action
  closeAllTabs = () => {
    this.tabs = []
  }

  @action
  closeTab = (id) => {
    this.tabs = this.tabs.filter(item => item.id !== id)
  }

  @action
  setActiveTab = (id) => {
    this.activeTab = id
  }

  @action
  updateTab = (id, data) => {
    this.tabs = this.tabs.map(tab => {
      if (tab.id === id) {
        return { ...tab, ...data };
      }
      return tab;
    })
  }

}

