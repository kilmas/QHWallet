import EOS from 'eosjs'

let instance

const Scatter = {
  get eosjs() {
    return instance
  },
  init(config = {}) {
    instance = EOS({
      chainId: config.chainId || 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      keyProvider: config.keyProvider,
      httpEndpoint: config.httpEndpoint || 'https://api.eoslaomao.com',
      logger: {
        log: null,
        error: null,
      },
    })
    return instance
  },
}

export default Scatter
