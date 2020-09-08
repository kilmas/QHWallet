import FIBOS from 'fibos.js'

let instance

const Ironman = {
  get fibos() {
    return instance
  },
  init(config = {}) {
    instance = FIBOS({
      chainId: config.chainId || '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a',
      keyProvider: config.keyProvider,
      httpEndpoint: config.httpEndpoint || 'https://to-rpc.fibos.io',
      logger: {
        log: null,
        error: null,
      },
    })
    return instance
  },
}

export default Ironman
