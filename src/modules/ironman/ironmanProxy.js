
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
        // alert(typeof t().getInfo)
        return new Proxy(t({
          chainId: r.chainId || "6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a",
          keyProvider: "",
          signProvider: async function({sign, buf, transaction}) {
            const {keyProvider} = config
          
            if(!keyProvider) {
              throw new TypeError('This transaction requires a config.keyProvider for signing')
            }
          
            let keys = keyProvider
            if(typeof keyProvider === 'function') {
              keys = keyProvider({transaction})
            }
          
            // keyProvider may return keys or Promise<keys>
            keys = await Promise.resolve(keys)
          
            if(!Array.isArray(keys)) {
              keys = [keys]
            }
          
            keys = keys.map(key => {
              try {
                // normalize format (WIF => PVT_K1_base58privateKey)
                return {private: ecc.PrivateKey(key).toString()}
              } catch(e) {
                // normalize format (EOSKey => PUB_K1_base58publicKey)
                return {public: ecc.PublicKey(key).toString()}
              }
              assert(false, 'expecting public or private keys from keyProvider')
            })
          
            if(!keys.length) {
              throw new Error('missing key, check your keyProvider')
            }
          
            // simplify default signing #17
            if(keys.length === 1 && keys[0].private) {
              const pvt = keys[0].private
              return sign(buf, pvt)
            }
          
            // offline signing assumes all keys provided need to sign
            if(config.httpEndpoint == null) {
              const sigs = []
              for(const key of keys) {
                sigs.push(sign(buf, key.private))
              }
              return sigs
            }
          
            const keyMap = new Map()
          
            // keys are either public or private keys
            for(const key of keys) {
              const isPrivate = key.private != null
              const isPublic = key.public != null
          
              if(isPrivate) {
                keyMap.set(ecc.privateToPublic(key.private), key.private)
              } else {
                keyMap.set(key.public, null)
              }
            }
          
            const pubkeys = Array.from(keyMap.keys())
          
            return eos.getRequiredKeys(transaction, pubkeys).then(({required_keys}) => {
              if(!required_keys.length) {
                throw new Error('missing required keys for ' + JSON.stringify(transaction))
              }
          
              const pvts = [], missingKeys = []
          
              for(let requiredKey of required_keys) {
                // normalize (EOSKey.. => PUB_K1_Key..)
                requiredKey = ecc.PublicKey(requiredKey).toString()
          
                const wif = keyMap.get(requiredKey)
                if(wif) {
                  pvts.push(wif)
                } else {
                  missingKeys.push(requiredKey)
                }
              }
          
              if(missingKeys.length !== 0) {
                assert(typeof keyProvider === 'function',
                  'keyProvider function is needed for private key lookup')
          
                // const pubkeys = missingKeys.map(key => ecc.PublicKey(key).toStringLegacy())
                keyProvider({pubkeys: missingKeys})
                  .forEach(pvt => { pvts.push(pvt) })
              }
          
              const sigs = []
              for(const pvt of pvts) {
                sigs.push(sign(buf, pvt))
              }
          
              return sigs
            })
          },
          httpEndpoint: e.host ? (e.protocol + "://" + e.host + ":" + e.port) : "https://to-rpc.fibos.io",
          logger: {
            log: null,
            error: null
          }
        }), {
          get: (_fibos, key) => {
            // return value normally
            _fibos.getCurrencyBalance = function (contract, name, coin) {
              return new Promise((resolve, reject) => {
                var key = new Date().getTime();
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ key, ironman: "getCurrencyBalance", params: { contract, name, coin } }));
                // 接收web消息，并将执行结果返回给Dapp
                document.addEventListener("message", function (msg) {
                  document.removeEventListener("message", this);
                  var obj = eval("(" + msg.data + ")");
                  if (obj.ironman === "getCurrencyBalance" && obj.key === key) {
                    resolve(obj.data);
                  }
                });
              })
            }
            //查询账号
            _fibos.getAccount = function (account) {
              return new Promise((resolve, reject) => {
                var key = new Date().getTime();
                // 给WebView发送一个消息，并且吧需要的参数传过去
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ key, ironman: "getAccount", params: { account } }));
                // 接收web消息，并将执行结果返回给Dapp
                document.addEventListener("message", function (msg) {
                  document.removeEventListener("message", this);
                  var obj = eval("(" + msg.data + ")");
                  if (obj.ironman === "getAccount" && obj.key === key) {
                    resolve(obj.data);
                  }
                });
              })
            },
            // 交易
            _fibos.transaction = function (actions) {
              return new Promise((resolve, reject) => {
                var key = new Date().getTime();
                // 给WebView发送一个消息，并且吧需要的参数传过去
                window.postMessage(JSON.stringify({ key, ironman: "transaction", params: { ...actions } }));
                // 接收web消息，并将执行结果返回给Dapp
                document.addEventListener("message", function (msg) {
                  document.removeEventListener("message", this);
                  var obj = eval("(" + msg.data + ")");
                  if (obj.ironman === "transaction" && obj.key === key) {
                    resolve(obj.data);
                  }
                });
              })
            }
            return _fibos[key]
          },
          set: (_fibos, key, value) => {
            // set value normally
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
  