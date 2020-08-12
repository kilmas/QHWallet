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
  COIN_TYPE_BTC,
  COIN_TYPE_USDT,
  BTC_INPUT_TYPE_P2SH,
  BTC_INPUT_TYPE_P2PKH,
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

const BITCOIN_SATOSHI = 100000000;

export default class BTCWallet extends Wallet {
  BTC = new BTCCoin();
  USDT = new USDT();

  browserRecord = 'https://btc.com/'
  /**
   *
   * @type {BTCExtendedKey}
   * @memberof BTCWallet
   */
  @persist('object', BTCExtendedKey) @observable extendedPublicKey = null;

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
    // this.extendedPublicKey = obj.extendedPublicKey && new BTCExtendedKey(obj.extendedPublicKey);
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
    this.startObserve();
  }
  static create(name, pwd) {
    return new Promise(async (resolve, reject) => {
      try {
        let mnemonic = await mnemonicGenerate();
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const node = bip32.fromSeed(seed);
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
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const node = bip32.fromSeed(seed);
        const path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
        const { address } = bitcoin.payments.p2pkh({ pubkey: node.derivePath(path).publicKey });
        const obj = {
          name,
          address,
          source: WALLET_SOURCE_MW,
          id: CryptoJS.MD5(address).toString(),
          type: COIN_TYPE_BTC
        };
        const act = new BTCWallet(obj);
        act.extendedPublicKey = await act.generatorXpubByNode(node)
        await act.generatorAddress(BTC_INPUT_TYPE_P2SH, node);
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
  static backupMnemonic(mnemonic) {
    return new Promise(async (resolve, reject) => {
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const node = bip32.fromSeed(seed);
      const path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
      const { address } = bitcoin.payments.p2pkh({ pubkey: node.derivePath(path).publicKey });

      const obj = {
        address,
        id: CryptoJS.MD5(address).toString(),
        source: WALLET_SOURCE_MW,
        type: COIN_TYPE_BTC,
        hasBackup: true
      };
      let act = new BTCWallet(obj);
      DeviceEventEmitter.emit("accountOnChange");
      resolve(act);
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
    const maximum = BigNumber.max(new BigNumber(this.BTC.balance + "").minus(fee), 0);

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
      throw new Error(strings("wallet-send-utxos-empty"));
    }

    const maximum = await this.calculateMaximumAmount(feePerByte);
    const showHand = new BigNumber(maximum).isEqualTo(amount + "");
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
  async isVaildPassword(pwd) {
    return true;
  }
  async exportPrivateKey(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
    }
    let result = await bitcoin.exportPrivateKey(this.id, pwd);
    if (Platform.OS === "android") {
      result = result.privateKey;
    }
    return result;
  }
  async exportMnemonic(pwd) {
    if (!pwd || pwd.length == 0) {
      throw new Error("密码不能为空");
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
    if (!key || !key.length > 0) {
      throw new Error(strings("common-password-incorrect"));
    }
    return new BTCExtendedKey({ key, path });
  };
  generatorXpubByNode = async (
    node,
    path = DFNetwork.env === NETWORK_ENV_TESTNET ? "m/44'/1'/0'" : "m/44'/0'/0'"
  ) => {
    const key = node.derivePath(path).neutered().toBase58();
    if (!key || !key.length > 0) {
      throw new Error(strings("common-password-incorrect"));
    }
    return new BTCExtendedKey({ key, path });
  };
  @action insertAddresses = async addresses => {
    this.addresses.unshift(...addresses);
    this.addressesMap = this.addresses.reduce((map, address) => {
      map[address.address] = address;
      return map;
    }, {});

    await AccountStorage.update();
  };
  /**
   *
   * @type {BTC_ADDRESS_TYPE_PKH|BTC_ADDRESS_TYPE_SH}
   * @memberof BTCWallet
   */
  @action generatorAddress = async (type, node) => {
    const addresses = this.addresses.filter(address => {
      const addType = addressType(address.address);
      return addType === type;
    });

    if (!node) {
      const mnemonics = await this.exportMnemonic(this.pwd);
      const seed = bip39.mnemonicToSeedSync(mnemonics);
      node = bip32.fromSeed(seed);
    }

    const index =
      addresses.length > 0
        ? addresses.reduce((result, address) => Math.max(result, parseInt(address.path.split("/").pop())), 0) + 1
        : 0;
    const path = `${this.extendedPublicKey.path}/0/${index}`;
    let address;
    switch (type) {
      case BTC_ADDRESS_TYPE_PKH: {
        const { publicKey: pubkey } = node.derivePath(path)
        address = new BIP44Address({
          address: bitcoin.payments.p2pkh({ pubkey: node.derivePath(path).publicKey, network }).address,
          path,
          pubkey: pubkey.toString('hex'),
        });
        break;
      }
      case BTC_ADDRESS_TYPE_SH: {
        const { publicKey: pubkey } = node.derivePath(path)
        const p2wpkh = bitcoin.payments.p2sh({
          redeem: bitcoin.payments.p2wpkh({ pubkey }),
        });
        address = new BIP44Address({
          address: p2wpkh.address,
          path,
          pubkey: pubkey.toString('hex'),
        });
        break;
      }
    }

    await this.insertAddresses([address]);
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
      AccountStorage.update();
    }
  };
  loopUtxos = async () => {
    try {
      const addressStr = this.addresses.map(address => address.address).join(',');
      const { data: addressBalances } = await btcComRequest.get(`/address/${addressStr}`);
      let addresses = []
      if (addressBalances && addressBalances.length) {
        addresses = addressBalances.filter(item => item.balance > 0)
      }
      if (addresses.length) {
        let upspents = await Promise.all(addresses.map(item => btcComRequest.get(`/address/${item.address}/unspent`)));
        upspents = upspents.map(upspent => {
          if (upspent.data && upspent.data.list) {
            return upspent.list;
          }
          return [];
        }).reduce((maps, upspentList) => { return maps.concat(upspentList) }, []);
      }
      const utxos = upspents.map(upspent => ({
        address: { pubkey: upspent.pubkey, },
        confirmations: upspent.confirmations,
        path: upspent.path,
        pubkey: upspent.pubkey,
        txid: upspent.tx_hash,
        vout: upspent.tx_output_n,
        amount: upspent.value,
      }))
      // const utxos = (await btcComRequest.get(`/address/update/${addressStr}`).data;

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

    return DFNetwork.post(
      "/addTrade",
      {
        postData: rawData,
        fromAddress: this.address,
        toAddress: to,
        tokenAddress: "btc",
        tokenType: type,
        orderCount: amount,
        walletAddress: this.id,
        txCreateTime: new Date().getTime(),
        fromAddressList: inputs,
        toAddressList: outputs,
        remark: note,
      },
      HD_BTC_API
    );
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
