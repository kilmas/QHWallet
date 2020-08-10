export default function RenderIronman(accounts, publicKey = '') {
  if (accounts.length) {
    return `
    var iden = {
      name: "${accounts[0].name}@active",
      publicKey: "${publicKey}",
      accounts: ${JSON.stringify(accounts)}
    };
    window.ironman = {
      identity: iden,
      getIdentity: function (id) {
        return new Promise((resolve, reject) => {
          resolve(iden);
        })
      },
      fibos: (e, t, r, n) => {
        return new Proxy(t({
          chainId: r.chainId || "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a",
          signProvider: ({sign, buf, transaction})=> {
            return new Promise((resolve, reject) => {
              var key = new Date().getTime();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ key, ironman: "signProvider", params: { transaction } }));
                document.addEventListener("message", function (msg) {
                  document.removeEventListener("message", this);
                  var obj = eval("(" + msg.data + ")");
                  if (obj.ironman === "signProvider" && obj.key === key) {
                    resolve(obj.data);
                  }
                });
              } else {
                reject('No ReactNativeWebView');
              }
            })
          },
          httpEndpoint: e.host ? (e.protocol + "://" + e.host + ":" + e.port) : "https://to-rpc.fibos.io",
          logger: {
            log: null,
            error: null
          }
        }), {
          get: (_fibos, key) => {
            return _fibos[key]
          },
          set: (_fibos, key, value) => {
            _fibos[key] = value
          },
        })
      }
    };

    // ironman注入成功，发送ironmanLoaded Event
    setTimeout(function () {
      var event = document.createEvent('HTMLEvents');
      event.initEvent("ironmanLoaded", true, true);
      event.eventType = 'ironmanLoaded';
      document.dispatchEvent(event);
    }, 1000);
    `
  }
  return ``
}