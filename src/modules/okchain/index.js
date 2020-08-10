import OKChainClient from '@okchain/javascript-sdk';

let instance;

const OKClient = {
  get oKClient() {
    return instance;
  },
  init(config = {}) {
    instance = new OKChainClient(config.url || 'https://www.okex.me');
    instance.setAccountInfo(config.privateKey)
    return instance;
  },
};

export default OKClient;
