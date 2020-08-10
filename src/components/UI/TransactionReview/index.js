import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from '@ant-design/react-native';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import TransactionReviewInformation from './TransactionReviewInformation';
import TransactionReviewData from './TransactionReviewData';
import TransactionReviewSummary from './TransactionReviewSummary';
import TransactionDirection from '../../../pages/TransactionDirection';
import ActionView from '../ActionView';
import { getTransactionReviewActionKey, getNormalizedTxState } from '../../../utils/transactions';
import { strings } from '../../../locales/i18n';

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1
  },
  overview: {
    flex: 1,
  },
  tabUnderlineStyle: {
    height: 2,
    backgroundColor: colors.blue
  },
  tabStyle: {
    paddingBottom: 0,
    backgroundColor: colors.beige
  },
  textStyle: {
    fontSize: 12,
    letterSpacing: 0.5,
    ...fontStyles.bold
  },
  error: {
    backgroundColor: colors.red000,
    color: colors.red,
    paddingVertical: 8,
    paddingHorizontal: 5,
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.5,
    marginHorizontal: 14,
    ...fontStyles.normal
  }
});

/**
 * Component that supports reviewing a transaction
 */
class TransactionReview extends React.Component {
  static propTypes = {
		/**
		 * Callback triggered when this transaction is cancelled
		 */
    onCancel: PropTypes.func,
		/**
		 * Called when a user changes modes
		 */
    onModeChange: PropTypes.func,
		/**
		 * Callback triggered when this transaction is cancelled
		 */
    onConfirm: PropTypes.func,
		/**
		 * Indicates whether hex data should be shown in transaction editor
		 */
    showHexData: PropTypes.bool,
		/**
		 * Whether the transaction was confirmed or not
		 */
    transactionConfirmed: PropTypes.bool,
		/**
		 * Transaction object associated with this transaction
		 */
    transaction: PropTypes.object,
		/**
		 * Callback to validate transaction in parent state
		 */
    validate: PropTypes.func
  };

  state = {
    toFocused: false,
    actionKey: strings('transactions.tx_review_confirm'),
    showHexData: false,
    error: undefined
  };

  componentDidMount = async () => {
    const {
      validate,
      transaction,
      transaction: { data }
    } = this.props;
    let { showHexData } = this.props;
    showHexData = showHexData || data;
    const error = validate && (await validate());
    const actionKey = await getTransactionReviewActionKey(transaction);
    this.setState({ error, actionKey, showHexData });
  };

  edit = () => {
    const { onModeChange } = this.props;
    onModeChange && onModeChange('edit');
  };

  renderTransactionDetails = () => {
    const { showHexData, actionKey } = this.state;
    const { transaction } = this.props;
    const tabs = [
      { title: strings('transaction.review_details') },
      { title: strings('transaction.review_data') },
    ];
    return (
      <View style={styles.overview}>
        {showHexData && transaction.data ? (
          <Tabs tabs={tabs}>
            <TransactionReviewInformation
              edit={this.edit}
              tabLabel={strings('transaction.review_details')}
            />
            <TransactionReviewData actionKey={actionKey} tabLabel={strings('transaction.review_data')} />
          </Tabs>
        ) : (
            <TransactionReviewInformation edit={this.edit} />
          )}
      </View>
        );
  };

  render = () => {
    const { transactionConfirmed} = this.props;
    const { actionKey, error} = this.state;
    return (
        <View style={styles.root}>
          <TransactionDirection />
          <ActionView
            confirmButtonMode="primary"
            cancelText={strings('transaction.reject')}
            onCancelPress={this.props.onCancel}
            onConfirmPress={this.props.onConfirm}
            confirmed={transactionConfirmed}
            confirmDisabled={error !== undefined}
          >
            <View style={baseStyles.flexGrow}>
              <TransactionReviewSummary actionKey={actionKey} />
              {this.renderTransactionDetails()}
              {!!error && <Text style={styles.error}>{error}</Text>}
            </View>
          </ActionView>
        </View>
    );
  };
}


export default inject(({ store: state }) => ({
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  showHexData: state.settings.showHexData,
  transaction: getNormalizedTxState(state),

}))(observer(TransactionReview))
