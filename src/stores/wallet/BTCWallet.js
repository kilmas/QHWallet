import { DeviceEventEmitter, Platform } from "react-native";
import { BigNumber } from "bignumber.js";
import CryptoJS from 'crypto-js';
import { persist } from "mobx-persist";
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import _ from "lodash";
import DFNetwork, { HD_BTC_API } from "../../modules/common/network";
import Wallet, { ExtendedKey, BIP44Address } from "./Wallet";
import { toFixedString } from "../../utils/NumberUtil";
import {
  WALLET_SOURCE_MW,
  WALLET_SOURCE_PK,
  SCHEMA_BTC,
  NETWORK_ENV_TESTNET,
  WALLET_TYPE_BTC,
  BTC_ADDRESS_TYPE_PKH,
  BTC_ADDRESS_TYPE_SH,
  BTC_ADDRESS_TYPE_KH,
  COIN_TYPE_BTC,
  COIN_TYPE_USDT,
  BTC_INPUT_TYPE_P2SH,
  BTC_INPUT_TYPE_P2PKH,
  BTC_INPUT_TYPE_P2KH,
} from "../../config/const";
import { BTCCoin, USDT } from "./Coin";
import { observable, action, reaction } from "mobx";
import { BTCInput, BTCTransaction } from "./btc/BTCTransaction";
import AccountStorage from "../account/AccountStorage";
import { USDTTransaction } from "./btc/USDTTransaction";
import {
  BTCSegwitP2SHInput,
  BTCSegwitP2SHTransaction,
  BTCSegwitP2SHUSDTTransaction,
} from "./btc/BTCSegwit";
import { btcComRequest } from "../../utils/request";
import { strings } from "../../locales/i18n";
import { addressType } from "./util/serialize";
import { sleep } from "../../utils/Timer";

const BITCOIN_SATOSHI = 100000000;

const rootHd = (mnemonics) => {
  const seed = bip39.mnemonicToSeedSync(mnemonics);
  return node = bip32.fromSeed(seed);
}

export default class BTCWallet extends Wallet {
  BTC = new BTCCoin();
  USDT = new USDT();

  index44 = 0;

  index49 = 0;

  index81 = 0;

  pAccount;

  browserRecord = 'https://btc.com/'
  /**
   *
   * @type {BTCExtendedKey}
   * @memberof BTCWallet
   */
  @persist('object', BTCExtendedKey) @observable extendedPublicKey;

  /**
 *
 * @type {BTCExtendedKey}
 * @memberof BTCWallet
 */
  @persist('object', BTCExtendedKey) @observable extendedPublicKey49;

  /**
*
* @type {BTCExtendedKey}
* @memberof BTCWallet
*/
  @persist('object', BTCExtendedKey) @observable extendedPublicKey84;

  /**
   *
   * @type {Array<BIP44Address>}
   * @memberof BTCWallet
   */
  @persist('list', BIP44Address) @observable addresses = [];

  /**
   *
   * @type {Object<string, BIP44Address>}
   * @memberof BTCWallet
   */
  addressesMap = {};

  /**
   *
   * @type {Array<BTCInput>}
   * @memberof BTCWallet
   */
  @persist('list') @observable utxos = [];


  @observable unspents = [];


  /**
   *
   * @type {BIP44Address}
   * @memberof BTCWallet
   */
  @persist('object', BIP44Address) @observable currentAddress = null;
  get defaultCoin() {
    return this.BTC;
  }
  get txListParams() {
    return {
      address: this.addresses.map(address => address.address),
    };
  }
  constructor(obj) {
    super(obj);
    this.path = this.path || DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    this.type = Wallet.WALLET_TYPE_BTC;
    this.coins = [this.BTC, this.USDT];
    // this.addresses = (obj.addresses &&
    //   obj.addresses.length > 0 &&
    //   _.compact(
    //     obj.addresses.map(address => {
    //       return address.address && new BIP44Address(address);
    //     })
    //   )) || [new BIP44Address({ address: this.address, path: this.path })];
    // this.addressesMap = this.addresses.reduce((map, address) => {
    //   map[address.address] = address;
    //   return map;
    // }, {});
    // this.currentAddress =
    //   (obj.currentAddress && obj.currentAddress.address && new BIP44Address(obj.currentAddress)) ||
    //   new BIP44Address({ address: this.address, path: this.path });
    // obj.coins &&
    //   obj.coins.forEach(coin => {
    //     const el = this.coins.find(el => el.id === coin.id);
    //     if (el) {
    //       el.balance = coin.balance;
    //       if (el.hasOwnProperty("display")) {
    //         el.display = coin.display;
    //       }
    //     }
    //   });
    // this.utxos =
    //   (obj.utxos &&
    //     obj.utxos.length > 0 &&
    //     _.compact(
    //       obj.utxos.map(utxo => {
    //         const type = addressType(utxo.address);
    //         switch (type) {
    //           case BTC_INPUT_TYPE_P2PKH:
    //             return new BTCInput(utxo);
    //           case BTC_INPUT_TYPE_P2SH:
    //             return new BTCSegwitP2SHInput(utxo);
    //         }
    //         return undefined;
    //       })
    //     )) ||
    //   [];
    // check address
    // setTimeout(()=>{
    //   if(this.addresses.length && !this.addresses.find(address => address.address === this.address)) {
    //     this.addresses.push(new BIP44Address({
    //       address: this.address,
    //       path: this.path,
    //     }));
    //   }
    // }, 5000)
    this.startObserve();
  }
  static create(name, pwd) {
    return new Promise(async (resolve, reject) => {
      try {
        let mnemonic = await mnemonicGenerate();
        const node = rootHd(mnemonic)
        const path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
        const { address } = bitcoin.payments.p2pkh({ pubkey: node.derivePath(path).publicKey });
        const obj = {
          address,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_BTC
        };
        let act = new BTCWallet({ ...obj, source: WALLET_SOURCE_MW });
        act.name = name;
        act.save();
        resolve({ act, mnemonic });
      } catch (error) {
        reject(error);
      }
    });
  }
  static import(mnemonic, pwd, name = "", fetch) {
    return new Promise(async (resolve, reject) => {
      try {
        const node = rootHd(mnemonic)
        const path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0"
        const pubkey = node.derivePath(path).publicKey
        const { address } = bitcoin.payments.p2pkh({ pubkey });
        const obj = {
          name,
          address,
          source: WALLET_SOURCE_MW,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_BTC,
        };
        const act = new BTCWallet(obj);
        act.insertAddresses([new BIP44Address({
          address,
          path,
        })])
        act.extendedPublicKey = act.generatorXpubByNode(node)
        act.extendedPublicKey49 = act.generatorXpubByNode(node, "m/49'/0'/0'")
        act.extendedPublicKey84 = act.generatorXpubByNode(node, "m/84'/0'/0'")

        act.generatorAddress(BTC_INPUT_TYPE_P2SH, node);
        act.generatorAddress(BTC_INPUT_TYPE_P2KH, node);
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }
  static importPK(pk, pwd, name, note) {
    return new Promise(async (resolve, reject) => {
      try {
        const keyPair = bitcoin.ECPair.fromWIF(pk);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
        const obj = {
          name,
          address,
          isBackup: true,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_BTC,
          source: WALLET_SOURCE_PK
        };
        const act = new BTCWallet(obj);
        act.save();
        DeviceEventEmitter.emit("accountOnChange");
        resolve(act);
      } catch (error) {
        reject(error);
      }
    });
  }
  startObserve = () => {
    super.startObserve();
    reaction(
      () =>
        toFixedString(
          this.utxos.reduce((res, utxo) => res.plus(utxo.satoshis), new BigNumber(0)).div(BITCOIN_SATOSHI),
          8
        ),
      balance => {
        this.BTC.balance = balance;
      }
    );
    setTimeout(() => {
      this.getUtxos()
    }, 3000)
  };
  drop = text => {

  };
  sendUSDTTransaction = async (to, amount, feePerByte, pwd, note) => {
    if (this.utxos.length == 0 && this.BTC.balance != 0) {
      await this.fetchUtxos();
    }

    if (this.utxos.length == 0) {
      throw new Error(strings("wallet-send-utxos-empty"));
    }

    const tx = BTCSegwitP2SHUSDTTransaction.from(
      this.utxos,
      this.address,
      to,
      amount,
      this.currentAddress.address,
      feePerByte,
      this.USDT
    );

    await tx.signInputs(
      async (rawSigHash, sigHashType, path) => await bitcoin.signHash(this.id, rawSigHash, sigHashType, path, pwd)
    );
    const utxos = await tx.outputs2utxos((txid, output, vout) => {
      const address = this.addressesMap[output.address];
      if (!address) {
        return undefined;
      }
      const amount = toFixedString(new BigNumber(output.satoshis).div(BITCOIN_SATOSHI));
      const type = addressType(address.address);
      switch (type) {
        case BTC_INPUT_TYPE_P2PKH:
          return new BTCInput({ address, vout, txid, amount });
        case BTC_INPUT_TYPE_P2SH:
          return new BTCSegwitP2SHInput({ address, vout, txid, amount });
      }
    });
    const result = await this.broadcastRawTransaction(COIN_TYPE_USDT, tx, to, amount, note);
    this.utxos = _.xorWith(
      this.utxos.slice(),
      tx.inputs,
      (utxo, input) => utxo.txid === input.txid && utxo.vout === input.vout
    );
    this.utxos.push(...utxos);
  };
  calculateMaximumAmount = async feePerByte => {
    if (this.utxos.length == 0 && this.BTC.balance != 0) {
      await this.fetchUtxos();
    }

    const tx = BTCSegwitP2SHTransaction.from(this.utxos, this.address, 0, this.address, feePerByte, true);
    const fee = toFixedString(new BigNumber(tx.fee).div(BITCOIN_SATOSHI));
    const maximum = BigNumber.max(new BigNumber(`${this.BTC.balance}`).minus(fee), 0);

    return toFixedString(maximum);
  };
  estimateFee = ({ amount, feePerByte, showHand, coin }) => {
    if (amount === "") {
      amount = "0";
    }
    if (isNaN(parseFloat(amount))) {
      return "-1";
    }
    try {
      const fee =
        coin instanceof USDT
          ? USDTTransaction.estimateFee(
            this.utxos,
            this.address,
            this.address,
            amount,
            this.currentAddress.address,
            feePerByte,
            coin
          )
          : BTCTransaction.estimateFee(
            this.utxos,
            this.address,
            amount,
            this.currentAddress.address,
            feePerByte,
            showHand
          );
      return toFixedString(new BigNumber(fee).div(BITCOIN_SATOSHI)) || "-1";
    } catch (error) {
      return "-1";
    }
  };
  sendRawTransaction = async (to, amount, feePerByte, pwd, note) => {
    if (this.utxos.length == 0 && this.BTC.balance != 0) {
      await this.fetchUtxos();
    }

    if (this.utxos.length == 0) {
      throw new Error(strings("wallet send utxos empty"));
    }

    const maximum = await this.calculateMaximumAmount(feePerByte);
    const showHand = new BigNumber(maximum).isEqualTo(`${amount}`);
    const tx = BTCSegwitP2SHTransaction.from(this.utxos, to, amount, this.currentAddress.address, feePerByte, showHand);

    await tx.signInputs(
      async (rawSigHash, sigHashType, path) => await bitcoin.signHash(this.id, rawSigHash, sigHashType, path, pwd)
    );
    const utxos = await tx.outputs2utxos((txid, output, vout) => {
      const address = this.addressesMap[output.address];
      if (!address) {
        return undefined;
      }
      const amount = toFixedString(new BigNumber(output.satoshis).div(BITCOIN_SATOSHI));
      const type = addressType(address.address);
      switch (type) {
        case BTC_INPUT_TYPE_P2PKH:
          return new BTCInput({ address, vout, txid, amount });
        case BTC_INPUT_TYPE_P2SH:
          return new BTCSegwitP2SHInput({ address, vout, txid, amount });
      }
    });

    const result = await this.broadcastRawTransaction(COIN_TYPE_BTC, tx, to, amount, note);
    this.utxos = _.xorWith(
      this.utxos.slice(),
      tx.inputs,
      (utxo, input) => utxo.txid === input.txid && utxo.vout === input.vout
    );
    this.utxos.push(...utxos);
    return result;
  };

  async exportPrivateKey(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
    let result
    if (this.pAccount) {
      if (this.pAccount.walletType) {
        result = await this.pAccount.exportPrivateKey(pwd)
      } else if (this.pAccount.type) {
        result = await this.pAccount.exportMnemonic(pwd)
      }
    }
    return result;
  }

  async exportMnemonic(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
    if (this.pAccount) {
      return this.pAccount.exportMnemonic(pwd)
    }
  }

  exportExtendedPublicKey = async (
    pwd,
    path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
  ) => {
    const mnemonic = await this.exportMnemonic(pwd);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed);
    const key = node.derivePath(path).neutered().toBase58();
    return new BTCExtendedKey({ key, path });
  };

  generatorXpubByNode = async (
    node,
    path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
  ) => {
    const key = node.derivePath(path).neutered().toBase58();
    return new BTCExtendedKey({ key, path });
  };

  @action insertAddresses = async addresses => {
    this.addresses.unshift(...addresses);
    this.addressesMap = this.addresses.reduce((map, address) => {
      map[address.address] = address;
      return map;
    }, {});
  };

  @action genAddress = async (type, pwd) => {
    const mnemonics = await this.exportMnemonic(pwd)
    return this.genAddressByMnemonic(type, rootHd(mnemonics))
  }

  @action genAddressByMnemonic = async (type, mnemonics) => {
    return this.generatorAddress(type, rootHd(mnemonics))
  }

  /**
   *
   * @type {BTC_ADDRESS_TYPE_PKH|BTC_ADDRESS_TYPE_SH|BTC_ADDRESS_TYPE_KH}
   * @type {}
   * @memberof BTCWallet
   */
  @action generatorAddress = async (type, node) => {
    const addresses = this.addresses.filter(address => {
      const addType = addressType(address.address);
      return addType === type;
    });
    const index =
      addresses.length > 0
        ? addresses.reduce((result, address) => Math.max(result, parseInt(address.path.split("/").pop())), 0) + 1
        : 0;
    let BIPAddress;
    switch (type) {
      case BTC_ADDRESS_TYPE_PKH: {
        const bip = '44'
        const path = `m/${bip}'/0'/0'/0/${index}`
        const { publicKey: pubkey } = node.derivePath(path)
        BIPAddress = new BIP44Address({
          address: bitcoin.payments.p2pkh({ pubkey, network }).address,
          path,
          pubkey: pubkey.toString('hex'),
        });
        break;
      }
      case BTC_ADDRESS_TYPE_SH: {
        const bip = '49'
        const path = `m/${bip}'/0'/0'/0/${index}`
        const { publicKey: pubkey } = node.derivePath(path)
        const { address } = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({ pubkey }),
        });
        BIPAddress = new BIP44Address({
          address,
          path,
          pubkey: pubkey.toString('hex'),
          bip,
        });
        break;
      }
      case BTC_ADDRESS_TYPE_KH: {
        const bip = '84'
        const path = `m/${bip}'/0'/0'/0/${index}`
        const { publicKey: pubkey } = node.derivePath(path)
        const { address } = bitcoin.payments.p2wpkh({ pubkey })
        BIPAddress = new BIP44Address({
          address,
          path,
          pubkey: pubkey.toString('hex'),
          bip,
        });
        break;
      }
    }

    await this.insertAddresses([BIPAddress]);
    return this.addresses[0];
  };

  /**
   *
   * @param {BIP44Address|String} address
   * @memberof BTCWallet
   */
  @action setCurrentAddress = address => {
    if (address instanceof BIP44Address && address.address) {
      this.currentAddress = address;
      // AccountStorage.update();
    }
  };
  getUtxos = async () => {
    try {
      const unspents = await Promise.all(this.addresses.map(address => btcComRequest.unspents(address.address)))
      const utxos = unspents.reduce((a, b) => a.concat(b), [])
      const txHashs = await Promise.all(utxos.map(tx => btcComRequest.txHash(tx.tx_hash)))
      this.unspents = utxos.map((utxo, index) => {
        return {
          txId: utxo.tx_hash,
          vout: utxo.tx_output_n,
          value: utxo.value,
          nonWitnessUtxo: Buffer.from(txHashs[index].witness_hash, 'hex'),
          witnessUtxo: {
            script: Buffer.from(txHashs[index].outputs[utxo.tx_output_n].script_hex, 'hex'),
            value: txHashs[index].outputs[utxo.tx_output_n].value,
          }
        }
      })
    } catch (error) {
      console.warn(error)
    }
  };

  sendTransaction = async (to, amount, feeRate) => {
    let utxos = this.unspents
    let targets = [
      {
        address: to,
        value: amount
      }
    ]

    // ...
    const { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)

    // the accumulated fee is always returned for analysis
    console.log(fee)

    // .inputs and .outputs will be undefined if no solution was found
    if (!inputs || !outputs) return

    let psbt = new bitcoin.Psbt()

    inputs.forEach(input =>
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        nonWitnessUtxo: input.nonWitnessUtxo,
        // OR (not both)
        witnessUtxo: input.witnessUtxo,
      })
    )
    outputs.forEach(output => {
      // watch out, outputs may have been added that you need to provide
      // an output address/script for
      if (!output.address) {
        // output.address = wallet.getChangeAddress()
        // wallet.nextChangeAddress()
      }

      psbt.addOutput({
        address: output.address,
        value: output.value,
      })
    })
  };

  fetchUtxos = async () => {
    try {
      // await this.syncAddress()
    } catch (error) { }

    try {
      const utxos = (
        await network.get(
          "/getBtcUtxosByPub",
          {
            walletAddresses: this.extendedPublicKey.key,
          },
          HD_BTC_API
        )
      ).data;
      for (const utxo of utxos) {
        const address = utxo.address;
        utxo.address = this.addressesMap[utxo.address];
        if (!utxo.address || !utxo.address.pubkey) {
          //获得本地没有的地址时
          try {
            const relativePath = utxo.path
              .split(this.extendedPublicKey.path)
              .slice(-1)
              .pop();
            if (!relativePath || relativePath.length == 0) {
              throw new Error("vaild path");
            }
            const [pubkey] = await this.extendedPublicKey.generatePublicKey([relativePath]);
            if (!utxo.address) {
              utxo.address = new BIP44Address({ address, path: utxo.path, pubkey });
              this.insertAddresses([utxo.address]);
            }
            utxo.address.pubkey = pubkey;
          } catch (error) { }
        }
      }
      this.utxos = _.compact(
        utxos.map(utxo => {
          utxo.confirmations = parseInt(utxo.confirmations);
          if (isNaN(utxo.confirmations) || !utxo.address) {
            return undefined;
          }

          const type = addressType(utxo.address.address);
          switch (type) {
            case BTC_INPUT_TYPE_P2PKH:
              return new BTCInput(utxo);
            case BTC_INPUT_TYPE_P2SH:
              return new BTCSegwitP2SHInput(utxo);
          }
        })
      ).sort((a, b) => (new BigNumber(a.satoshis).minus(b.satoshis).isGreaterThanOrEqualTo(0) ? -1 : 1));
    } catch (error) { }
  };
  // https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki
  // bitcoin:<address>[?amount=<amount>][?label=<label>][?message=<message>]
  paymentScheme = (amount, coin) => {
    return `bitcoin:${this.address}?coin=${coin.name}${amount >= 0 ? `&amount=${amount}` : ""}`;
  };
  decodePaymentScheme = (scheme) => {
    const type = WALLET_TYPE_BTC;
    if (scheme.indexOf(SCHEMA_BTC) != 0) {
      return {};
    }

    let split = scheme.split("?");
    let address = split[0].substring(8);
    let query =
      split.length > 1
        ? split[1].split("&").reduce((query, item) => {
          let itemSplit = item.split("=");
          if (itemSplit.length == 2) {
            query[itemSplit[0]] = itemSplit[1];
          }
          return query;
        }, {})
        : {};

    let amount = query["amount"];
    let coinName = query["coin"];
    let coin = this.findCoin(coinName) || this.BTC;
    return { address, amount, coin, type };
  };
  broadcastRawTransaction = async (type, tx, to, amount, note = "") => {
    const rawData = tx.serialized(true);
    const inputs = tx.inputs.map(input => {
      return {
        address: input.address.address,
        orderCount: input.amount,
      };
    });
    const outputs = tx.outputs.map(output => {
      const amount = new BigNumber(output.satoshis).div(BITCOIN_SATOSHI);
      return {
        address: output.address,
        orderCount: toFixedString(amount, 8),
      };
    });
    // post data
  };
}

class BTCExtendedKey extends ExtendedKey {
  stashedPubkeys = {};
  generatePublicKey = async paths => {
    const result = paths.map(path => {
      return {
        path,
        pubkey: this.stashedPubkeys[path],
      };
    });

    const needPaths = result.filter(obj => !obj.pubkey).map(obj => obj.path);

    let pubkeys = [];
    if (needPaths.length > 0) {
      pubkeys = await bitcoin.publicKeys(this.key, needPaths);
    }

    return result.map(obj => {
      if (obj.pubkey) {
        return obj.pubkey;
      }

      const pubkey = pubkeys.shift();
      this.stashedPubkeys[obj.path] = pubkey;
      return pubkey;
    });
  };
}
export { BTCExtendedKey };
