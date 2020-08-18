import { action, observable } from 'mobx';

class Store {
  @observable newVersion = false;
  @observable availableBTC = 0;
  @observable totalCreditLine = 0;
  @observable loadingId = 0;

  @action
  setNewVersion = newVersion => {
    this.newVersion = newVersion;
  };

  @action
  setTotalCreditLine = totalCreditLine => {
    this.totalCreditLine = totalCreditLine;
  };

  @action
  setLoadingId = (id) => {
    this.loadingId = id
  }
}

export default new Store();
