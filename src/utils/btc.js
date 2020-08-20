// import * as axios from 'axios'
const axios = require('axios')
const bitcoin = require('bitcoinjs-lib')
// const baseURL = 'https://chain.api.btc.com/v3/';
// const instance = axios.create({
//   baseURL,
//   timeout: 30 * 1000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// //响应拦截器即异常处理
// instance.interceptors.response.use(
//   ({status, data}) => {
//     if (status === 200) {
//       return data;
//     }
//     return Promise.reject(status);
//   },
//   err => {
//     if (err && err.response) {
//       let errStatusTips = {
//         400: '错误请求',
//         401: '未授权，请重新登录',
//         403: '拒绝访问',
//         404: '请求错误,未找到该资源',
//         405: '请求方法未允许',
//         408: '请求超时',
//         500: '服务器端出错',
//         501: '网络未实现',
//         502: '网络错误',
//         503: '服务不可用',
//         504: '网络超时',
//         505: 'http版本不支持该请求',
//       };

//       err.message = errStatusTips[err.response.status];
//     } else {
//       err.message = '连接到服务器失败';
//     }
//     return Promise.reject(err.message);
//   },
// );

const assert = require('assert')
const rng = require('randombytes')
const bs58check = require('bs58check')
// const dhttpCallback = require('dhttp/200')
let RANDOM_ADDRESS
class RegBtcUtils {
  constructor(_opts) {
    this._APIURL = (_opts || {}).APIURL || 'https://chain.api.btc.com/v3'
    this._APIPASS = (_opts || {}).APIPASS || 'satoshi'
    // regtest network parameters
    this.network = bitcoin.networks.bitcoin || {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'bcrt',
      bip32: {
        public: 0x043587cf,
        private: 0x04358394,
      },
      pubKeyHash: 0x6f,
      scriptHash: 0xc4,
      wif: 0xef,
    }
    this.httpInstance = axios.create({
      baseURL: this._APIURL,
      timeout: 30 * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  get RANDOM_ADDRESS() {
    if (RANDOM_ADDRESS === undefined) {
      RANDOM_ADDRESS = this.randomAddress()
    }
    return RANDOM_ADDRESS
  }
  // use Promises
  async dhttp(options) {
    return new Promise((resolve, reject) => {
      this.httpInstance
        .request(options)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
    // return new Promise((resolve, reject) => {
    //   return dhttpCallback(options, (err, data) => {
    //     if (err) return reject(err)
    //     else return resolve(data)
    //   })
    // })
  }
  async broadcast(rawhex) {
    return this.dhttp({
      method: 'POST',
      url: '/tools/tx-publish',
      data: {
        rawhex
      },
    })
  }
  async mine(count) {
    // /r/generate?count=${count}&key=${this._APIPASS}
    const data = await this.dhttp({
      method: 'POST',
      url: `/address/tx`,
    })
  }
  async height() {
    const res = await this.dhttp({
      method: 'GET',
      url: `/block/latest`,
    })
    const { data: { data: { height } } } = res
    return Number(height)
  }
  async fetch(txId) {
    const { data } = await this.dhttp({
      method: 'GET',
      url: `/tx/${txId}`,
    })
    return data
  }
  async unspents(address) {
    ///address/{address}/unspent
    const { data: { data : { list = [] } = {} } } = await this.dhttp({
      method: 'GET',
      url: `/address/${address}/unspent`,
    })
    const results = list.map(unspent => {
      // const script = !!unspent.address
      //   ? bitcoin.address.toOutputScript(unspent.address, this.network)
      //   : null
      return {
        value_int: unspent.value,
        txid: unspent.tx_hash,
        n: unspent.tx_output_n2,
        // ...(!unspent.address ? {} : { addresses: [unspent.address] }),
        // ...(!unspent.address ? {} : { script_pub_key: {
        //   asm: bitcoin.script.toASM(script),
        //   hex: script.toString('hex')
        // } }),
      }
    })
    return results
  }
  async faucet(address, value) {
    const requester = _faucetRequestMaker('faucet', 'address', this.dhttp, this._APIURL, this._APIPASS)
    const faucet = _faucetMaker(this, requester)
    return faucet(address, value)
  }
  async faucetComplex(output, value) {
    const outputString = output.toString('hex')
    const requester = _faucetRequestMaker('faucetScript', 'script', this.dhttp, this._APIURL, this._APIPASS)
    const faucet = _faucetMaker(this, requester)
    return faucet(outputString, value)
  }
  async verify(txo) {
    const tx = await this.fetch(txo.txId)
    const txoActual = tx.outs[txo.vout]
    if (txo.address) assert.strictEqual(txoActual.address, txo.address)
    if (txo.value) assert.strictEqual(txoActual.value, txo.value)
  }
  randomAddress() {
    // Fake P2PKH address with regtest/testnet version byte
    return bs58check.encode(Buffer.concat([Buffer.from([0x6f]), rng(20)]))
  }
}
function _faucetRequestMaker(name, paramName, dhttp, url, pass) {
  return async (address, value) =>
    dhttp({
      method: 'POST',
      url: `${url}/r/${name}?${paramName}=${address}&value=${value}&key=${pass}`,
    })
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function _faucetMaker(self, _requester) {
  return async (address, value) => {
    let count = 0
    let _unspents = []
    const randInt = (min, max) => min + Math.floor((max - min + 1) * Math.random())
    while (_unspents.length === 0) {
      if (count > 0) {
        if (count >= 5) throw new Error('Missing Inputs')
        console.log('Missing Inputs, retry #' + count)
        await sleep(randInt(150, 250))
      }
      const txId = await _requester(address, value).then(v => v).catch(async err => {
        // Bad Request error is fixed by making sure height is >= 432
        const currentHeight = await self.height()
        if (err.message === 'Bad Request' && currentHeight < 432) {
          await self.mine(432 - currentHeight)
          return _requester(address, value)
        } else if (err.message === 'Bad Request' && currentHeight >= 432) {
          return _requester(address, value)
        } else {
          throw err
        }
      })
      await sleep(randInt(50, 150))
      const results = await self.unspents(address)
      _unspents = results.filter(x => x.txId === txId)
      count++
    }
    return _unspents.pop()
  }
}

exports.RegBtcUtils = RegBtcUtils;
// export default RegBtcUtils
