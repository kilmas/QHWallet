const CryptoJS = require('crypto-js')
const AES = CryptoJS.AES
const pbkdf2 = CryptoJS.PBKDF2

/**
 * Class that exposes two public methods: Encrypt and Decrypt
 * This is used by the KeyringController to encrypt / decrypt the state
 * which contains sensitive seed words and addresses
 */
export default class Encryptor {
  key = null

  _generateSalt(byteCount = 32) {
    const view = new Uint8Array(byteCount)
    global.crypto.getRandomValues(view)
    const b64encoded = btoa(String.fromCharCode.apply(null, view))
    return b64encoded
  }

  _generateKey = (password, salt) => pbkdf2(password, salt)

  _keyFromPassword = (password, salt) => {
    return this._generateKey(password, salt).toString()
  }

  _encryptWithKey = (text, keyBase64) => {
    const ivBase64 = this._generateSalt(32)
    const key = CryptoJS.enc.Base64.parse(keyBase64)
    const iv = CryptoJS.enc.Base64.parse(ivBase64)
    return {
      iv: ivBase64,
      cipher: AES.encrypt(text, key, { iv }).toString(),
    }
    // return AES.encrypt(text, keyBase64, ivBase64).then(cipher => ({ cipher, iv: ivBase64 }));
  }

  _decryptWithKey = (encryptedData, key) => {
    const iv = CryptoJS.enc.Base64.parse(encryptedData.iv)
    const bytes = AES.decrypt(encryptedData.cipher, CryptoJS.enc.Base64.parse(key), {
      iv,
    })
    const originalText = bytes.toString(CryptoJS.enc.Utf8)
    return originalText
    // return Aes.decrypt(encryptedData.cipher, key, encryptedData.iv);
  }

  /**
   * Encrypts a JS object using a password (and AES encryption with native libraries)
   *
   * @param {string} password - Password used for encryption
   * @param {object} object - Data object to encrypt
   * @returns - Promise resolving to stringified data
   */
  encrypt = async (password, object) => {
    const salt = this._generateSalt(16)
    // const key = await this._keyFromPassword(password, salt);
    const key = this._keyFromPassword(password, salt)
    // const result = await this._encryptWithKey(JSON.stringify(object), key);
    const result = this._encryptWithKey(JSON.stringify(object), key)
    result.salt = salt
    return JSON.stringify(result)
  }

  /**
   * Decrypts an encrypted JS object (encryptedString)
   * using a password (and AES deccryption with native libraries)
   *
   * @param {string} password - Password used for decryption
   * @param {string} encryptedString - String to decrypt
   * @returns - Promise resolving to decrypted data object
   */
  decrypt = async (password, encryptedString) => {
    const encryptedData = JSON.parse(encryptedString)
    // const key = await this._keyFromPassword(password, encryptedData.salt);
    const key = this._keyFromPassword(password, encryptedData.salt)
    // const data = await this._decryptWithKey(encryptedData, key);
    const data = this._decryptWithKey(encryptedData, key)
    return JSON.parse(data)
  }
}
