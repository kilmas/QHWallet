import { action, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { getTxData, getTxMeta } from '../utils/transaction-reducer-helpers'

import TransactionTypes from '../modules/metamask/core/TransactionTypes'

const {
  ASSET: { ETH, ERC20, ERC721 },
} = TransactionTypes

const getAssetType = selectedAsset => {
  let assetType
  if (selectedAsset) {
    if (selectedAsset.tokenId) {
      assetType = 'ERC721'
    } else if (selectedAsset.isETH) {
      assetType = 'ETH'
    } else {
      assetType = 'ERC20'
    }
  }
  return assetType
}

export default class Transaction {
  @persist @observable ensRecipient = undefined
  @persist @observable assetType = undefined
  @persist('object') @observable selectedAsset = {}
  @persist('object') @observable transaction = {
    data: undefined,
    from: undefined,
    gas: undefined,
    gasPrice: undefined,
    to: undefined,
    value: undefined,
  }
  @persist @observable transactionTo = undefined
  @persist @observable transactionToName = undefined
  @persist @observable transactionFromName = undefined
  @persist @observable transactionValue = undefined
  @persist @observable symbol = undefined
  @persist @observable paymentChannelTransaction = undefined
  @persist @observable paymentRequest = undefined
  @persist @observable readableValue = undefined
  @persist @observable id = undefined
  @persist @observable type = undefined

  @action
  setEtherTransaction = transaction => {

      this.symbol = 'ETH';
      this.assetType = 'ETH',
      this.selectedAsset = { isETH: true, symbol: 'ETH' }
      this.type = 'ETHER_TRANSACTION'
      const txMeta = getTxMeta(transaction)
  
      Object.keys(txMeta).forEach(key => {
        this[key] = txMeta[key]
      })
      this.transaction = getTxData(transaction)
  }

  @action
  setTransactionObject = transaction => {
    const selectedAsset = transaction.selectedAsset
    if (selectedAsset) {
      const assetType = getAssetType(selectedAsset)
      transaction.assetType = assetType
    }
    const txMeta = getTxMeta(transaction)

    this.transaction = {
      ...this.transaction,
      ...getTxData(transaction),
    }

    Object.keys(txMeta).forEach(key => {
      this[key] = txMeta[key]
    })
  }

  @action
  prepareTransaction = transaction => {
    this.transaction = transaction
  }

  @action
  setSelectedAsset = selectedAsset => {
    // const assetType = selectedAsset.isETH ? ETH : selectedAsset.tokenId ? ERC721 : ERC20
    this.selectedAsset = selectedAsset
    this.assetType = getAssetType(selectedAsset)
  }

  @action
  resetTransaction = () => {
    this.ensRecipient = undefined
    this.assetType = undefined
    this.selectedAsset = {}
    this.transaction = {
      data: undefined,
      from: undefined,
      gas: undefined,
      gasPrice: undefined,
      to: undefined,
      value: undefined,
    }
    this.transactionTo = undefined
    this.transactionToName = undefined
    this.transactionFromName = undefined
    this.transactionValue = undefined
    this.symbol = undefined
    this.paymentChannelTransaction = undefined
    this.paymentRequest = undefined
    this.readableValue = undefined
    this.id = undefined
    this.type = undefined
  }

  @action
  newAssetTransaction = selectedAsset => {
    this.ensRecipient = undefined
    this.transaction = {
      data: undefined,
      from: undefined,
      gas: undefined,
      gasPrice: undefined,
      to: undefined,
      value: undefined,
    }
    this.transactionTo = undefined
    this.transactionToName = undefined
    this.transactionFromName = undefined
    this.transactionValue = undefined
    this.symbol = undefined
    this.paymentChannelTransaction = undefined
    this.paymentRequest = undefined
    this.readableValue = undefined
    this.id = undefined
    this.type = undefined

    this.selectedAsset = selectedAsset
    this.assetType = selectedAsset.isETH ? ETH : selectedAsset.tokenId ? ERC721 : ERC20
  }
  @action
  setRecipient = (from, to, ensRecipient, transactionToName, transactionFromName) => {
    this.transaction = { ...this.transaction, from }
    this.ensRecipient = ensRecipient
    this.transactionTo = to
    this.transactionToName = transactionToName
    this.transactionFromName = transactionFromName
  }
}
