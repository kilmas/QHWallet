import TronWeb from 'tronweb'

let instance

const Tronweb = {
  get instance() {
    if (instance) {
      return instance
    }
    return Tronweb.init()
  },
  init(config = {}) {
    instance = new TronWeb({
      ...config,
      fullHost: 'https://api.trongrid.io',
    })
    return instance
  },
}

export default Tronweb
