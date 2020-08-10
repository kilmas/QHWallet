import { action, observable } from 'mobx';

class Store {
  @observable newVersion = false;
  @observable availableBTC = 0;
  @observable totalCreditLine = 0;

  @action
  setNewVersion = newVersion => {
    this.newVersion = newVersion;
  };

  @action
  setTotalCreditLine = totalCreditLine => {
    this.totalCreditLine = totalCreditLine;
  };
}

export default new Store();
