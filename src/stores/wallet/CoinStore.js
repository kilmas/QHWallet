import { observable, reaction, computed } from "mobx";
import network, { EXCHANGE_RATE_API } from "../../modules/common/network";
import { toSignificanceNumber } from "../../utils/NumberUtil";
import { COIN_ID_BTC, COIN_ID_ETH, COIN_ID_USDT, CURRENCY_TYPE_CNY, CURRENCY_TYPE_USD, COIN_ID_FO, COIN_ID_OKT } from "../../config/const";
import storage from "../../utils/Storage";
import { fibosRequest, request } from '../../utils/request'


const COINSTORE_PRICE_STORAGE_KEY = "COINSTORE-PRICE-STORAGE-KEY";
const COINSTORE_CURRENCY_STORAGE_KEY = "COINSTORE-CURRENCY-STORAGE-KEY";
class CoinPrice {
  id = 0;
  @observable USD = 0;
  @observable CNY = 0;


  constructor({ tokenId, priceUSD = 0 }) {
    this.id = tokenId;
    this.USD = toSignificanceNumber(priceUSD, 8);
  }
  toJSON() {
    return {
      tokenId: this.id,
      priceUSD: this.USD,
    };
  }
}
class CoinStore {
  @observable currency = CURRENCY_TYPE_CNY;
  @computed get currencySymbol() {
    switch (this.currency) {
      case CURRENCY_TYPE_CNY:
        return "¥";
      case CURRENCY_TYPE_USD:
        return "$";
    }
  }
  @observable map = new Map();
  constructor() {
    this.map.set(COIN_ID_BTC, new CoinPrice({ tokenId: COIN_ID_BTC }));
    this.map.set(COIN_ID_USDT, new CoinPrice({ tokenId: COIN_ID_USDT, priceUSD: 1 }));
    this.map.set(COIN_ID_ETH, new CoinPrice({ tokenId: COIN_ID_ETH }));
    this.map.set(COIN_ID_FO, new CoinPrice({ tokenId: COIN_ID_FO }));
    this.map.set(COIN_ID_OKT, new CoinPrice({ tokenId: COIN_ID_OKT }));
  }

  get BTCPrice() {
    return this.getPrice(COIN_ID_BTC);
  }

  get ETHPrice() {
    return this.getPrice(COIN_ID_ETH);
  }

  get USDTPrice() {
    return this.getPrice(COIN_ID_USDT);
  }

  get FOPrice() {
    return this.getPrice(COIN_ID_FO);
  }
  
  get OKTPrice() {
    return this.getPrice(COIN_ID_OKT);
  }

  @observable CNYRate = 7;

  async start() {
    try {
      const ret = await storage.load({ key: COINSTORE_PRICE_STORAGE_KEY });
      ret && ret.forEach(el => (el[0] ? this.map.set(el[0], new CoinPrice(el[1])) : null));
    } catch (error) {}

    try {
      const currency = await storage.load({ key: COINSTORE_CURRENCY_STORAGE_KEY });
      this.currency = currency || CURRENCY_TYPE_CNY;
    } catch (error) {
    } finally {
      reaction(
        () => this.currency,
        currency => {
          storage.save({
            key: COINSTORE_CURRENCY_STORAGE_KEY,
            data: currency,
          });
        }
      );
    }
  }
  observePrice(id) {
    if (!id || this.map.has(id)) {
      return;
    }
    const coin = new CoinPrice({ tokenId: id });
    this.map.set(id, coin);
    return coin;
  }
  getPrice(id) {
    let rate = 1
    if (this.currency === CURRENCY_TYPE_CNY) {
      rate = this.CNYRate
    }
    return (this.map.get(id) && this.map.get(id).USD) * rate || 0;
  }
  getFloatingPrice(id) {
    return (this.map.get(id) && this.map.get(id)[`${this.currency}Floating`]) || 0;
  }

  fetchPrice = async () => {
    try {
      this.CNYRate = await request.getExchangerate()
      const FOCoin = this.map.get(COIN_ID_FO);
      FOCoin.USD = await fibosRequest.getPrice();
      const OKBCoin = this.map.get(COIN_ID_OKT);
      OKBCoin.USD = await request.getPrice('OKB');
      const BTCCoin = this.map.get(COIN_ID_BTC);
      BTCCoin.USD = await request.getPrice('BTC');
      const ETHCoin = this.map.get(COIN_ID_ETH);
      ETHCoin.USD = await request.getPrice('ETH');
      // storage.save({
      //   key: COINSTORE_PRICE_STORAGE_KEY,
      //   data: [...this.map],
      // });
    } catch (error) {}
  };

  match(id) {
    return this.map.get(id);
  }
  /**
   * 拥有该币种的钱包
   *
   * @param {string} id
   * @returns {array}
   * @memberof CoinStore
   */
  filterWallets(id) {
    // return WalletStore.list.filter((wallet) => !!wallet.findCoin(id))
  }
}

export default new CoinStore();
