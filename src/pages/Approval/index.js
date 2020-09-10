import React from 'react'
import { SafeAreaView, StyleSheet, Alert, InteractionManager, View } from 'react-native'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import TransactionEditor from '../../components/UI/TransactionEditor'
import { BNToHex, hexToBN } from '../../utils/number'
// import { getTransactionOptionsTitle } from '../../UI/Navbar';
import { colors } from '../../styles/common'
import { getTransactionReviewActionKey, getNormalizedTxState } from '../../utils/transactions'
import { safeToChecksumAddress } from '../../utils/address'
import Engine from '../../modules/metamask/core/Engine'
import TransactionsNotificationManager from '../../modules/metamask/core/TransactionsNotificationManager'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import Container from '../../components/Container'

const REVIEW = 'review'
const EDIT = 'edit'
const APPROVAL = 'Approval'

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1,
  },
})

/**
 * PureComponent that manages transaction approval from the dapp browser
 */
class Approval extends React.Component {
  // static navigationOptions = ({ navigation }) => getTransactionOptionsTitle('approval.title', navigation);

  static propTypes = {
    /**
     * react-navigation object used for switching between screens
     */
    navigation: PropTypes.object,
    /**
     * Action that cleans transaction state
     */
    resetTransaction: PropTypes.func.isRequired,
    /**
     * Transaction state
     */
    transaction: PropTypes.object.isRequired,
    /**
     * List of transactions
     */
    transactions: PropTypes.array,
    /**
     * A string representing the network name
     */
    networkType: PropTypes.string,
  }

  state = {
    mode: REVIEW,
    transactionHandled: false,
    transactionConfirmed: false,
  }

  componentWillUnmount = () => {
    const { transactionHandled } = this.state
    const { transaction } = this.props
    if (!transactionHandled) {
      Engine.context.TransactionController.cancelTransaction(transaction.id)
    }
    Engine.context.TransactionController.hub.removeAllListeners(`${transaction.id}:finished`)
    this.clear()
  }

  componentDidMount = () => {
    const { navigation } = this.props
    navigation && navigation.setParams({ mode: REVIEW, dispatch: this.onModeChange })
  }

  /**
   * Call Analytics to track confirm started event for approval screen
   */
  trackEditScreen = async () => {}

  /**
   * Call Analytics to track cancel pressed
   */
  trackOnCancel = () => {}

  /**
   * Call Analytics to track confirm pressed
   */
  trackOnConfirm = () => {}

  /**
   * Returns corresponding tracking params to send
   *
   * @return {object} - Object containing view, network, activeCurrency and assetType
   */
  getTrackingParams = () => {
    const {
      networkType,
      transaction: { selectedAsset, assetType },
    } = this.props
    return {
      view: APPROVAL,
      network: networkType,
      activeCurrency: selectedAsset.symbol || selectedAsset.contractName,
      assetType,
    }
  }

  /**
   * Transaction state is erased, ready to create a new clean transaction
   */
  clear = () => {
    this.props.resetTransaction()
  }

  onCancel = () => {
    this.props.navigation.pop()
    this.state.mode === REVIEW && this.trackOnCancel()
  }

  /**
   * Callback on confirm transaction
   */
  onConfirm = async () => {
    const { TransactionController } = Engine.context
    const {
      transactions,
      transaction: { assetType, selectedAsset },
    } = this.props
    let { transaction } = this.props
    this.setState({ transactionConfirmed: true })
    try {
      if (assetType === 'ETH') {
        transaction = this.prepareTransaction(transaction)
      } else {
        transaction = this.prepareAssetTransaction(transaction, selectedAsset)
      }

      TransactionController.hub.once(`${transaction.id}:finished`, transactionMeta => {
        if (transactionMeta.status === 'submitted') {
          this.setState({ transactionHandled: true })
          this.sending == false
          this.props.navigation.pop()
          TransactionsNotificationManager.watchSubmittedTransaction({
            ...transactionMeta,
            assetType: transaction.assetType,
          })
        } else {
          throw transactionMeta.error
        }
      })

      const fullTx = transactions.find(({ id }) => id === transaction.id)
      const updatedTx = { ...fullTx, transaction }
      await TransactionController.updateTransaction(updatedTx)
      await TransactionController.approveTransaction(transaction.id)
    } catch (error) {
      Alert.alert(strings('transactions.transaction_error'), error && error.message, [{ text: strings('navigation.ok') }])
      this.setState({ transactionHandled: false })
    }
    this.setState({ transactionConfirmed: false })
    this.trackOnConfirm()
  }

  /**
   * Handle approval mode change
   * If changed to 'review' sends an Analytics track event
   *
   * @param mode - Transaction mode, review or edit
   */
  onModeChange = mode => {
    const { navigation } = this.props
    navigation && navigation.setParams({ mode })
    this.setState({ mode })
    InteractionManager.runAfterInteractions(() => {
      mode === REVIEW && this.trackConfirmScreen()
      mode === EDIT && this.trackEditScreen()
    })
  }

  /**
   * Returns transaction object with gas, gasPrice and value in hex format
   *
   * @param {object} transaction - Transaction object
   */
  prepareTransaction = transaction => ({
    ...transaction,
    gas: BNToHex(transaction.gas),
    gasPrice: BNToHex(transaction.gasPrice),
    value: BNToHex(transaction.value),
    to: safeToChecksumAddress(transaction.to),
  })

  /**
   * Returns transaction object with gas and gasPrice in hex format, value set to 0 in hex format
   * and to set to selectedAsset address
   *
   * @param {object} transaction - Transaction object
   * @param {object} selectedAsset - Asset object
   */
  prepareAssetTransaction = (transaction, selectedAsset) => ({
    ...transaction,
    gas: BNToHex(transaction.gas),
    gasPrice: BNToHex(transaction.gasPrice),
    value: '0x0',
    to: selectedAsset.address,
  })

  sanitizeTransaction(transaction) {
    transaction.gas = hexToBN(transaction.gas)
    transaction.gasPrice = hexToBN(transaction.gasPrice)
    transaction.value = hexToBN(transaction.value)
    return transaction
  }

  render() {
    const { transaction } = this.props
    const { mode } = this.state
    return (
      <Container>
        <TitleBar title={strings('approval.title')} />
        <SafeAreaView style={styles.wrapper}>
          <TransactionEditor
            promptedFromApproval
            mode={mode}
            onCancel={this.onCancel}
            onConfirm={this.onConfirm}
            onModeChange={this.onModeChange}
            transaction={transaction}
            navigation={this.props.navigation}
            transactionConfirmed={this.state.transactionConfirmed}
          />
        </SafeAreaView>
      </Container>
    )
  }
}

export default inject(({ store: state }) => ({
  transaction: getNormalizedTxState(state),
  transactions: state.engine.backgroundState.TransactionController.transactions,
  networkType: state.engine.backgroundState.NetworkController.provider.type,
  resetTransaction: () => state.transaction.resetTransaction(),
}))(observer(Approval))
