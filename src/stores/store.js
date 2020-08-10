import AsyncStorage from "@react-native-community/async-storage";

class Store {

  stateStorage = "stateStorage"

  constructor() {
    this._stateStorage()
  }

  /**
   * 从本地存储中查询对象
   * @returns {Promise<void>}
   * @private
  */
  async _stateStorage() {
    const value = await AsyncStorage.getItem(this.stateStorage);
    this.userbean = value ? JSON.parse(value) : {};
  }
}

export default Store;