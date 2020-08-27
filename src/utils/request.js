import * as Qs from 'qs'
import * as axios from 'axios'

const baseURL = ''
const scanURL = ''
const rateURL = ''
const btcComUrl = 'https://chain.api.btc.com/v3'

const fibosApiUrl = 'https://api.fowallet.net'

export const ENV = 'test' // production | test | staging

const fetchTimeout = 30000

const errStatusTips = {
  400: '错误请求',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求错误,未找到该资源',
  405: '请求方法未允许',
  408: '请求超时',
  500: '服务器端出错',
  501: '网络未实现',
  502: '网络错误',
  503: '服务不可用',
  504: '网络超时',
  505: 'http版本不支持该请求',
}

let host
if (ENV === 'production') {
  host = ''
} else if (ENV === 'test') {
  host = ''
} else if (ENV === 'staging') {
  host = ''
} else {
  host = ''
}

const instance = axios.create({
  baseURL,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})
const btcComInstance = axios.create({
  baseURL: btcComUrl,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})

//响应拦截器即异常处理
btcComInstance.interceptors.response.use(
  res => res,
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${errStatusTips[err.response.status]}`
    } else {
      err.message = '连接到服务器失败'
    }
    return Promise.reject(err.message)
  }
)


const prepareResult = function (feeByBlockTarget) {
  var kb = 1000
  var list = Object.keys(feeByBlockTarget).
    map(function (k) { return Math.floor(feeByBlockTarget[k] / kb) })
  return list
}

export const btcRequest = {
  getAddress: async address => {
    try {
      const { data: { data = {} } = {} } = await btcComInstance.request({
        method: 'GET',
        url: `/address/${address}`,
      })
      return data
    } catch (error) {
      console.warn(error)
    }
    return {}
  },
  unspents: async address => {
    let list = []
    try {
      const {
        data: { data },
      } = await btcComInstance.request({
        method: 'GET',
        url: `/address/${address}/unspent`,
      })
      list = data ? data.list : []
    } catch (e) {
      console.warn(e)
    }
    return list
  },
  txHash: async tx => {
    try {
      if (!tx) return
      const {
        data: { data },
      } = await btcComInstance.request({
        method: 'GET',
        url: `/tx/${tx}?verbose=3`,
      })
      return data
    } catch (e) {
      console.warn(e)
    }
  },
  getFee: async () => {
    try {
      const { data } = await axios.get(`https://bitcoinfees.earn.com/api/v1/fees/recommended`)
      return data
    } catch (error) {
      console.warn(error)
    }
    return { fastestFee: 0, halfHourFee: 0, hourFee: 0 }
  },
  recommended: async () => {
    const { data: res } = await axios.get('https://www.bitgo.com/api/v1/tx/fee?numBlocks=2')
    var list = prepareResult(res.feeByBlockTarget)
    var n = 0
    var spb1 = list.length > n ? list[n++] : 0
    var spb2 = list.length > n ? list[n++] : spb1
    var spb3 = list.length > n ? list[n++] : spb2
    return {
      "fastestFee": spb1, "halfHourFee": spb2, "hourFee": spb3
    }
  },
  broadcast: async rawhex => {
    try {
      const { data } = await axios.post(`https://api.blockcypher.com/v1/btc/main/txs/push`, {
        rawhex,
      })
      return true
    } catch (error) {
      console.warn(error)
    }
    return false
  },
  multiaddr: async (addresses) => {
    try {
      const { data: { addresses } } = await axios.post(`https://blockchain.info/multiaddr?active=${addresses}`)
      return addresses
    } catch (error) {
      console.warn(error)
    }
    return []
  },
  unspentByAddrs: async (addresses) => {
    console.log(addresses)
    try {
      const { data: { addresses } } = await axios.post(`https://blockchain.info/unspent?active=${addresses}`)
      return addresses
    } catch (error) {
      console.warn(error)
    }
    return []
  }
}

//响应拦截器即异常处理
instance.interceptors.response.use(
  ({ status, data }) => {
    if (status === 200) {
      return data
    }
    return Promise.reject(status)
  },
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${errStatusTips[err.response.status]}`
    } else {
      err.message = '连接到服务器失败'
    }
    return Promise.reject(err.message)
  }
)

//响应拦截器即异常处理
instance.interceptors.response.use(
  ({ status, data }) => {
    if (status === 200) {
      return data
    }
    return Promise.reject(status)
  },
  err => {
    if (err && err.response) {
      err.message = `${err.response.status}: ${errStatusTips[err.response.status]}`
    } else {
      err.message = '连接到服务器失败'
    }
    return Promise.reject(err.message)
  }
)

export const hostRequest = {
  get: url => fetch(host + url).then(res => res.json()),

  post: (url, params = {}) => {
    const opt = {}
    opt.method = 'post'
    opt.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    opt.body = JSON.stringify(params)
    return fetch(host + url, opt).then(res => res.json())
  },
}

// Make a request for a user with a given ID
export const request = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      instance
        .get(url, {
          ...params,
        })
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  post: (url, params, option) => {
    return new Promise((resolve, reject) => {
      instance
        .post(url, params, option)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  getExchangerate: async (symple = 'USD', ret = 'CNY') => {
    try {
      const {
        data: { rates },
      } = await axios.get(`https://api.exchangerate-api.com/v4/latest/${symple}`)
      return rates[ret]
    } catch (err) {
      console.warn(err)
    }
    return 7
  },
  getPrice: async coin => {
    let price = 1
    try {
      const {
        data: {
          data: { last },
        },
      } = await axios.get(`https://www.okex.me/api/index/v3/${coin}-USD/constituents`)
      return Number(last)
    } catch (err) {
      console.warn(err)
    }
    return price
  },
}

export const timeoutPromise = (fetchPromise, timeout = fetchTimeout) => {
  const abortPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('网络请求超时\nNetwork request timed out'))
    }, timeout)
  })

  return Promise.race([fetchPromise, abortPromise])
}

const fibosApi = axios.create({
  baseURL: fibosApiUrl,
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const fibosInstance = axios.create({
  baseURL: 'https://api.fibos.rocks',
  timeout: 30 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fibosRequest = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      fibosInstance
        .get(url, {
          ...params,
        })
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  post: (url, params, option) => {
    return new Promise((resolve, reject) => {
      fibosInstance
        .post(url, params, option)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  getPrice: async () => {
    let price = 0
    try {
      const {
        data: { data },
      } = await fibosApi.post('/1.0/app/tokenpair/getSwapRankOnChain', { tokenx: 'FO@eosio', tokeny: 'FOUSDT@eosio' })
      if (Array.isArray(data)) {
        const totalWeights = data[data.length - 1]
        const { tokenx_quantity, tokeny_quantity } = totalWeights
        price = tokenx_quantity / tokeny_quantity
      }
    } catch (err) {
      console.warn(err)
    }
    return price
  },
}

const OK_API_URL = 'https://www.okex.me'
export const okChainRequest = {
  getValidators: () => axios.get(`${OK_API_URL}/okchain/v1/staking/validators?status=all`),
  getDelegators: address => axios.get(`${OK_API_URL}/okchain/v1/staking/delegators/${address}`),
}
