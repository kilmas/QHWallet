import OKChainClient from '@okchain/javascript-sdk';

let instance = new OKChainClient('https://www.okex.me');
const nativeDenom = "tokt"
const defaultFee = {
  amount: [{
    amount: "0.00200000",
    denom: nativeDenom,
  }],
  gas: "200000",
}

const OKClient = {
  get oKClient() {
    return instance;
  },
  init(config = {}) {
    if (config.url) {
      instance = new OKChainClient(config.url);
    }
    instance.setAccountInfo(config.privateKey)
    return instance;
  },
  delegate: async (amount) => {
    const msg = [{
      type: "okchain/staking/MsgDelegate",
      value: {
        "delegator_address": instance.address,
        "quantity": { "amount": amount, "denom": "tokt" }
      }
    }];
    const signMsg = msg
    const signedTx = await instance.buildTransaction(msg, signMsg, '', defaultFee, null)
    const res = await instance.sendTransaction(signedTx)
    return res
  },
  vote: async (validator_addresses) => {
    const msg = [{
      type: "okchain/staking/MsgVote",
      value: { "delegator_address": instance.address, "validator_addresses": validator_addresses }
    }];
    const signMsg = msg
    const signedTx = await instance.buildTransaction(msg, signMsg, '', defaultFee, null)
    const res = await instance.sendTransaction(signedTx)
    return res
  }
};

export default OKClient;
