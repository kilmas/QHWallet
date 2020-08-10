import { action, observable } from 'mobx'
import { persist } from 'mobx-persist'
export default class Privacy {

  @persist('object') @observable approvedHosts = {}
	@persist @observable privacyMode = true

  @action
  approveHost = hostname => {
    this.approvedHosts = {
      ...this.approvedHosts,
      [hostname]: true
    };
  };
}

