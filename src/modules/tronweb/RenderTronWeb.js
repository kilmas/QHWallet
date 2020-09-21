export default function RenderTronWeb(accounts) {
  if (accounts.length) {
    return `
      var getTronweb = function () {
        if (!window.TronWeb) {
          setTimeout(getTronweb, 1)
        } else if (!window.tronWeb) {
          window.tronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',
            // eventServer: 'https://api.someotherevent.io',
          })
          window.tronWeb.setAddress("${accounts[0]}")
          window.tronWeb.trx = new Proxy(window.tronWeb.trx, {
            get: (_trx, key) => {
              _trx.sign = function (transaction = false, privateKey = false, useTronHeader = true, multisig = false, callback = false) {
                return new Promise((resolve, reject) => {
                  var key = new Date().getTime();
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ key, tronWeb: "sign", params: { transaction, privateKey, useTronHeader, multisig, callback } }));
                  // 接收web消息，并将执行结果返回给Dapp
                  document.addEventListener("message", function (msg) {
                    document.removeEventListener("message", this);
                    var obj = eval("(" + msg.data + ")");
                    if (obj.tronWeb === "sign" && obj.key === key && obj.data) {
                      resolve(obj.data);
                    } else {
                      reject(obj.msg)
                    }
                  });
                })
              }
              return _trx[key]
            },
            set: (_trx, key, value) => {
              _trx[key] = value
            },
          })
          window.tronWeb.ready = true
        }
      }
      getTronweb();
    `
  }
  return ``
}
