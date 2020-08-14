import OKChainClient from '@okchain/javascript-sdk';

let instance = new OKChainClient('https://www.okex.me');

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
};

export default OKClient;
