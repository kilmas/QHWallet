export default function RenderIronman(accounts) {
  if (accounts.length) {
    return `
      window.tronWeb = new Proxy(window.tronWeb, {
        get: (_tronWeb, key) => {
          return _tronWeb[key]
        },
        set: (_tronWeb, key, value) => {
          _tronWeb[key] = value
        },
      })
    `
  }
  return ``
}