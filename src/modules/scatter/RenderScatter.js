export default function RenderScatter(accounts, publicKey = '') {
  if (accounts.length) {
    return `
    var iden = {
      name: "${accounts[0].name}@active",
      publicKey: "${publicKey}",
      accounts: ${JSON.stringify(accounts)}
    };
    window.scatter = {
      identity: iden,
      getIdentity: function (id) {
        return new Promise((resolve, reject) => {
          resolve(iden);
        })
      },
      eos: (e, t, r, n) => {
        return new Proxy(t({
          chainId: (r && r.chainId) || "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
          signProvider: ({sign, buf, transaction}) => {
            return new Promise((resolve, reject) => {
              var key = new Date().getTime();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ key, scatter: "signProvider", params: { transaction } }));
                document.addEventListener("message", function (msg) {
                  document.removeEventListener("message", this);
                  var obj = eval("(" + msg.data + ")");
                  if (obj.scatter === "signProvider" && obj.key === key && obj.data) {
                    resolve(obj.data);
                  } else {
                    reject(obj.msg)
                  }
                });
              } else {
                reject('No ReactNativeWebView');
              }
            })
          },
          httpEndpoint: e.host ? (e.protocol + "://" + e.host + ":" + e.port) : "https://api.eoslaomao.com",
          logger: {
            log: null,
            error: null
          }
        }), {
          get: (_eos, key) => {
            return _eos[key]
          },
          set: (_eos, key, value) => {
            _eos[key] = value
          },
        })
      }
    };

    // scatter注入成功，发送scatterLoaded Event
    setTimeout(function () {
      var event = document.createEvent('HTMLEvents');
      event.initEvent("scatterLoaded", true, true);
      event.eventType = 'scatterLoaded';
      document.dispatchEvent(event);
    }, 1000);
    `
  }
  return ``
}