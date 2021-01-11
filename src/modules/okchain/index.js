import OKChainClient from '@okexchain/javascript-sdk'
import httpProxy from '@okexchain/javascript-sdk/lib/httpProxy'
import { getUrl } from '../../utils/request'

let instance = new OKChainClient(getUrl.OK_API_URL)
const nativeDenom = 'tokt'
const defaultFee = {
  amount: [
    {
      amount: '0.00200000',
      denom: nativeDenom,
    },
  ],
  gas: '200000',
}

const OKClient = {
  get oKClient() {
    return instance
  },
  init(config = {}) {
    if (config.url) {
      instance = new OKChainClient(config.url)
    }
    instance.setAccountInfo(config.privateKey)
    return instance
  },
  setUrl(uri) {
    let url = uri
    if (!url) {
      if (getUrl.OK_API_URL === 'https://www.okexcn.com') {
        url = 'https://www.okex.com'
      } else {
        url = 'https://www.okexcn.com'
      }
    }
    getUrl.setOK_API_URL(url)
    instance.httpClient = new httpProxy(url);
  },
  delegate: async amount => {
    const msg = [
      {
        type: 'okexchain/staking/MsgDeposit',
        value: {
          delegator_address: instance.address,
          quantity: { amount: amount, denom: 'tokt' },
        },
      },
    ]
    const signMsg = msg
    const signedTx = await instance.buildTransaction(msg, signMsg, '', defaultFee, null)
    const res = await instance.sendTransaction(signedTx)
    return res
  },
  vote: async validator_addresses => {
    const msg = [
      {
        type: 'okexchain/staking/MsgAddShares',
        value: { delegator_address: instance.address, validator_addresses: validator_addresses },
      },
    ]
    const signMsg = msg
    const signedTx = await instance.buildTransaction(msg, signMsg, '', defaultFee, null)
    const res = await instance.sendTransaction(signedTx)
    return res
  },
  unBond: async amount => {
    const msg = [
      {
        type: 'okexchain/staking/MsgWithdraw',
        value: {
          delegator_address: instance.address,
          quantity: { amount: amount, denom: 'tokt' },
        },
      },
    ]
    const signMsg = msg
    const signedTx = await instance.buildTransaction(msg, signMsg, '', defaultFee, null)
    const res = await instance.sendTransaction(signedTx)
    return res
  },
}

export default OKClient
