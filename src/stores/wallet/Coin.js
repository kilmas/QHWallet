import { BigNumber } from "bignumber.js";
import { persist } from "mobx-persist";
import CoinStore from "./CoinStore";
import {
  COIN_ID_BTC,
  COIN_ID_ETH,
  NETWORK_ENV_TESTNET,
  COIN_ID_USDT,
  COIN_TYPE_BTC,
  COIN_TYPE_USDT,
  COIN_TYPE_ETH,
  COIN_TYPE_ETC,
  COIN_TYPE_FO,
  COIN_ID_FO,
  COIN_ID_OKT,
} from "../../config/const";
import { observable, computed, action } from "mobx";
import { toFixedNumber } from "../../utils/NumberUtil";
import network from "../../modules/common/network";

const OMNI_PROPERTY_ID_USDT = "1f";
const OMNI_PROPERTY_ID_OMNI_TEST = "2";
const DEFAULT_ICON_URL = "https://dapp.qingah.com";

export const FO_ICON = `https://fibos.io/imgs/854ad1ae16cb585bf1f37691616bcbe3.png`;

export const getIcon = (coin) => {
  switch (coin) {
    case 'FO':
      return FO_ICON;
    case 'BTC':
      return `${DEFAULT_ICON_URL}/BTC.png`;
    case 'ETH':
      return `${DEFAULT_ICON_URL}/ETH.png`;
    case 'OKT':
      return OKT_ICON;
    default:
      return '';
  }
}

export const OKT_ICON = `${DEFAULT_ICON_URL}/OKB.jpg`
class Coin {
  id = 0;
  @observable display = true;
  @observable icon = `${DEFAULT_ICON_URL}/default.png`;
  @persist @observable balance = 0;
  decimals;
  // @observable price = 0
  @computed get price() {
    return CoinStore.getPrice(this.id);
  }
  @computed get floatPrice() {
    return CoinStore.getFloatingPrice(this.id);
  }
  constructor(obj = {}) {
    if (obj.hasOwnProperty("display")) {
      this.display = obj.display;
    }
    this.id = obj.id;
    this.name = obj.name;
    if (obj.icon && obj.icon.length > 0) {
      this.icon = obj.icon;
    }
    this.balance = obj.balance || 0
    // this.price = obj.price || 0
    // CoinStore
  }

  @action
  setBalance = (balance) => {
    this.balance = balance
  }
  /**
   * 总价 balance * price
   * @type {number}
   * @readonly
   * @memberof Coin
   */
  @computed get totalPrice() {
    const balance = new BigNumber(`${this.balance}`);
    if (balance.isLessThan(0)) {
      return 0;
    }
    return toFixedNumber(balance.multipliedBy(`${this.price}`), 2);
  }
  @computed get floatingTotalPrice() {
    const balance = new BigNumber(`${this.balance}`);
    if (balance.isLessThan(0)) {
      return 0;
    }
    return toFixedNumber(this.floatPrice * this.balance, 2);
  }
  @computed get coinbase() {
    return toFixedNumber(this.totalPrice / CoinStore.BTCPrice, 4);
  }
  get txListParams() {
    throw "not implemented txListParams";
  }
}

class BTCCoin extends Coin {
  id = COIN_ID_BTC;
  name = "BTC";
  icon = `${DEFAULT_ICON_URL}/BTC.png`;
  decimals = 8;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_BTC,
    };
  }
}

class BCH extends Coin {
  id = COIN_ID_BCH;
  name = "BCH";
  icon = `${DEFAULT_ICON_URL}/BCH.png`;
  decimals = 8;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_BCH,
    };
  }
}

class BSV extends Coin {
  id = COIN_ID_BSV;
  name = "BSV";
  icon = `${DEFAULT_ICON_URL}/BSV.png`;
  decimals = 8;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_BSV,
    };
  }
}
class USDT extends Coin {
  id = COIN_ID_USDT;
  propertyId = network.env === NETWORK_ENV_TESTNET ? OMNI_PROPERTY_ID_OMNI_TEST : OMNI_PROPERTY_ID_USDT;
  name = "USDT";
  icon = `${DEFAULT_ICON_URL}/USDT.png`;
  decimals = 8;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_USDT,
    };
  }
}

class ETH extends Coin {
  id = COIN_ID_ETH;
  name = "ETH";
  decimals = 18;
  icon = `${DEFAULT_ICON_URL}/ETH.png`;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_ETH,
    };
  }
}

class ERC20Coin extends Coin {
  contract;
  decimals;
  constructor(obj = {}) {
    super(obj);
    this.contract = obj.contract;
    this.decimals = obj.decimals;
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenAddress: this.contract,
      tokenType: COIN_TYPE_ETH,
    };
  }
}

class ETC extends Coin {
  id = COIN_ID_ETC;
  name = "ETC";
  decimals = 18;
  icon = `${DEFAULT_ICON_URL}/ETC.png`;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_ETC,
    };
  }
}

class FO extends Coin {
  id = COIN_ID_FO;
  name = "FO";
  decimals = 4;
  icon = FO_ICON;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
  get txListParams() {
    return {
      tokenType: COIN_TYPE_FO,
    };
  }
}

class OKT extends Coin {
  id = COIN_ID_OKT;
  name = "OKT";
  decimals = 4;
  icon = OKT_ICON;
  constructor(obj = {}) {
    super(obj);
    // CoinStore.observePrice(this.id);
  }
}

class FOToken extends Coin {
  contract;
  decimals;
  constructor(obj = {}) {
    super(obj);
    this.contract = obj.contract;
    this.decimals = obj.decimals;
  }
  get txListParams() {
    return {
      tokenAddress: this.contract,
      tokenType: COIN_TYPE_FO,
    };
  }
}

export default Coin;
export { BTCCoin, BCH, BSV, USDT, ETH, ERC20Coin, ETC, FO, OKT, FOToken };
