import EOS from 'eosjs';

let instance;

const Scatter = {
  get eosjs() {
    return instance;
  },
  init(config = {}) {
    instance = EOS({
      chainId: config.chainId || "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a",
      keyProvider: config.keyProvider || "KeyProvider",
      httpEndpoint: config.httpEndpoint || "https://to-rpc.fibos.io",
      logger: {
        log: null,
        error: null
      }
    });
    return instance;
  },

};

export default Scatter;
