import _ from "lodash";
const CryptoJS = require("crypto-js");

export default {
  aesEncrypt(data, secretKey) {
    return CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  },
  aesDecrypt(data, secretKey) {
    return CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
  },
  hash160(data, { asByte = false } = {}) {
    if (asByte && _.isString(data)) {
      data = CryptoJS.enc.Hex.parse(data);
    }
    return CryptoJS.RIPEMD160(this.sha256(data));
  },
  sha256(data, { asByte = false } = {}) {
    if (asByte && _.isString(data)) {
      data = CryptoJS.enc.Hex.parse(data);
    }
    return CryptoJS.SHA256(data);
  },
  sha3(data, length = 256) {
    return CryptoJS.SHA3(data, { outputLength: length });
  },
  toWordsArray(hex) {
    return CryptoJS.enc.Hex.parse(hex);
  },
};
