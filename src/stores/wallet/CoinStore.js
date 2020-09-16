import { observable, reaction, computed, action } from 'mobx'
import { persist, create } from 'mobx-persist'
import { toSignificanceNumber } from '../../utils/NumberUtil'
import { COIN_ID_BTC, COIN_ID_ETH, COIN_ID_USDT, CURRENCY_TYPE_CNY, CURRENCY_TYPE_USD, COIN_ID_FO, COIN_ID_OKT, COIN_ID_EOS } from '../../config/const'
import storage from '../../utils/Storage'
import { fibosRequest, request } from '../../utils/request'
import AsyncStorage from '@react-native-community/async-storage'

const COINSTORE_PRICE_STORAGE_KEY = 'COINSTORE-PRICE-STORAGE-KEY'
const COINSTORE_CURRENCY_STORAGE_KEY = 'COINSTORE-CURRENCY-STORAGE-KEY'
class CoinPrice {
  @persist @observable id
  @persist @observable USD = 0
  // @observable CNY = 0;

  constructor({ tokenId, priceUSD } = {}) {
    if (tokenId !== undefined) {
      this.id = `${tokenId}`
    }
    if (priceUSD) {
      this.USD = toSignificanceNumber(priceUSD, 8)
    }
  }

  @action
  setUSD(USD) {
    this.USD = USD
  }
}

class CoinStore {
  @persist @observable currency = CURRENCY_TYPE_CNY
  @computed get currencySymbol() {
    switch (this.currency) {
      case CURRENCY_TYPE_CNY:
        return '¥'
      case CURRENCY_TYPE_USD:
        return '$'
    }
  }

  @persist('map', CoinPrice) @observable map = new Map()
  constructor() {}

  @action setCurrency = type => {
    this.currency = type
  }

  @action init() {
    if (!this.map.get(`${COIN_ID_BTC}`)) {
      this.map.set(COIN_ID_BTC, new CoinPrice({ tokenId: COIN_ID_BTC }))
    }
    if (!this.map.get(`${COIN_ID_USDT}`)) {
      this.map.set(`${COIN_ID_USDT}`, new CoinPrice({ tokenId: COIN_ID_USDT, priceUSD: 1 }))
    }
    if (!this.map.get(`${COIN_ID_ETH}`)) {
      this.map.set(`${COIN_ID_ETH}`, new CoinPrice({ tokenId: COIN_ID_ETH }))
    }
    if (!this.map.get(`${COIN_ID_FO}`)) {
      this.map.set(`${COIN_ID_FO}`, new CoinPrice({ tokenId: COIN_ID_FO }))
    }
    if (!this.map.get(`${COIN_ID_OKT}`)) {
      this.map.set(`${COIN_ID_OKT}`, new CoinPrice({ tokenId: COIN_ID_OKT }))
    }
    if (!this.map.get(`${COIN_ID_EOS}`)) {
      this.map.set(`${COIN_ID_EOS}`, new CoinPrice({ tokenId: COIN_ID_EOS }))
    }
  }
  get BTCPrice() {
    return this.getPrice(`${COIN_ID_BTC}`)
  }

  get ETHPrice() {
    return this.getPrice(COIN_ID_ETH)
  }

  get USDTPrice() {
    return this.getPrice(COIN_ID_USDT)
  }

  get FOPrice() {
    return this.getPrice(COIN_ID_FO)
  }

  get OKTPrice() {
    return this.getPrice(COIN_ID_OKT)
  }

  get EOSPrice() {
    return this.getPrice(COIN_ID_EOS)
  }

  @observable CNYRate = 7

  async start() {
    try {
      const ret = await storage.load({ key: COINSTORE_PRICE_STORAGE_KEY })
      ret && ret.forEach(el => (el[0] ? this.map.set(el[0], new CoinPrice(el[1])) : null))
    } catch (error) {}

    try {
      const currency = await storage.load({ key: COINSTORE_CURRENCY_STORAGE_KEY })
      this.currency = currency || CURRENCY_TYPE_CNY
    } catch (error) {
    } finally {
      reaction(
        () => this.currency,
        currency => {
          storage.save({
            key: COINSTORE_CURRENCY_STORAGE_KEY,
            data: currency,
          })
        }
      )
    }
  }
  observePrice(id) {
    if (!id || this.map.has(id)) {
      return
    }
    const coin = new CoinPrice({ tokenId: id })
    this.map.set(id, coin)
    return coin
  }
  getPrice(id) {
    let rate = 1
    if (this.currency === CURRENCY_TYPE_CNY) {
      rate = this.CNYRate
    }
    return (this.map.get(`${id}`) && this.map.get(`${id}`).USD) * rate || 0
  }
  getFloatingPrice(id) {
    return (this.map.get(`${id}`) && this.map.get(`${id}`)[`${this.currency}Floating`]) || 0
  }

  @action
  fetchPrice = async () => {
    try {
      this.init()
      request.getExchangerate().then(rate => {
        if (rate) {
          this.CNYRate = rate
        }
      })
      fibosRequest.getPrice().then(usd => {
        if (usd) {
          const FOCoin = this.map.get(`${COIN_ID_FO}`)
          FOCoin && FOCoin.setUSD(usd)
        }
      })
      request.getPrice('OKB').then(usd => {
        if (usd) {
          const OKBCoin = this.map.get(`${COIN_ID_OKT}`)
          OKBCoin && OKBCoin.setUSD(usd)
        }
      })
      request.getPrice('BTC').then(usd => {
        if (usd) {
          const BTCCoin = this.map.get(`${COIN_ID_BTC}`)
          BTCCoin && BTCCoin.setUSD(usd)
        }
      })
      request.getPrice('ETH').then(usd => {
        if (usd) {
          const ETHCoin = this.map.get(`${COIN_ID_ETH}`)
          ETHCoin && ETHCoin.setUSD(usd)
        }
      })
      request.getPrice('EOS').then(usd => {
        if (usd) {
          const EOSCoin = this.map.get(`${COIN_ID_EOS}`)
          EOSCoin && EOSCoin.setUSD(usd)
        }
      })
    } catch (error) {}
  }

  match(id) {
    return this.map.get(id)
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

const coinStore = new CoinStore()
const hydrate = create({ storage: AsyncStorage, jsonify: true })
hydrate('coinStore', coinStore).then(store => {
  store.fetchPrice()
})

export default coinStore
