import { action, observable } from 'mobx'
import { persist } from 'mobx-persist'

export default class Modals {

  @persist @observable networkModalVisible = false;
  @persist @observable accountsModalVisible = false;
  @persist @observable collectibleContractModalVisible = false;
  @persist @observable receiveModalVisible = false;
  @persist('object') @observable receiveAsset = {};

  @action
  toggleNetworkModal = () => {
    this.networkModalVisible = !this.networkModalVisible
  };

  @action
  toggleReceiveModal = (asset) => {
    this.receiveAsset = asset
    this.receiveModalVisible = !this.receiveModalVisible
  };
}
