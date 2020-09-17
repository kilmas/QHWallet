import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import { strings } from '../../../../locales/i18n';

const styles = StyleSheet.create({
  overview: {
    paddingHorizontal: 24
  },
  label: {
    flex: 0,
    paddingRight: 18
  },
  labelText: {
    ...fontStyles.bold,
    color: colors.grey400,
    fontSize: 12
  },
  functionType: {
    ...fontStyles.normal,
    color: colors.black,
    fontSize: 12,
    padding: 16
  },
  hexData: {
    ...fontStyles.normal,
    backgroundColor: colors.white,
    color: colors.black,
    // flex: 1,
    fontSize: 12,
    minHeight: 100,
    padding: 16
  },
  topOverviewRow: {
    borderBottomWidth: 1,
    borderColor: colors.grey200
  },
  overviewRow: {
    paddingVertical: 15
  }
});

/**
 * PureComponent that supports reviewing transaction data
 */
class TransactionReviewData extends React.Component {
  static propTypes = {
		/**
		 * Transaction object associated with this transaction
		 */
    transaction: PropTypes.object,
		/**
		 * Transaction corresponding action key
		 */
    actionKey: PropTypes.string
  };

  render() {
    const {
      transaction: { transaction: { data } },
      actionKey
    } = this.props;
    return (
      <View style={styles.overview}>
        {actionKey !== strings('transactions.tx_review_confirm') && (
          <View style={[styles.overviewRow, styles.topOverviewRow]}>
            <View style={styles.label}>
              <Text style={styles.labelText}>{strings('transaction.review_function_type')}</Text>
              <Text style={styles.functionType}>{actionKey}</Text>
            </View>
          </View>
        )}
        <View style={styles.overviewRow}>
          <View style={styles.label}>
            <Text style={styles.labelText}>{strings('transaction.review_hex_data')}:</Text>
          </View>
          <TextInput
            multiline
            placeholder={strings('transaction.optional')}
            placeholderTextColor={colors.grey100}
            style={styles.hexData}
            value={data}
            editable={false}
          />
        </View>
      </View>
    );
  };
}

export default inject(({ store: state }) => ({
  conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
  currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
  contractExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates,
  transaction: state.transaction

}))(observer(TransactionReviewData))
