import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableHighlight, StyleSheet, Text, View, Image } from 'react-native';
import { inject, observer } from 'mobx-react';
import contractMap from 'eth-contract-metadata';
import FadeIn from 'react-native-fade-in-image';
import { Button, Icon, Modal } from '@ant-design/react-native';
import { colors, fontStyles } from '../../../styles/common';
import { toDateFormat } from '../../../utils/date';
import Identicon from '../Identicon';
import TransactionDetails from './TransactionDetails';
import { safeToChecksumAddress } from '../../../utils/address';
import TokenImage from '../TokenImage';
import Networks from '../../../utils/networks';
import Device from '../../../utils/devices';
import decodeTransaction from './utils';
import { strings } from '../../../locales/i18n';
import AppConstants from '../../../modules/metamask/core/AppConstants';

const {
  CONNEXT: { CONTRACTS }
} = AppConstants;

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.white,
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey100
  },
  rowContent: {
    padding: 0
  },
  rowOnly: {
    padding: 15,
    minHeight: Device.isIos() ? 95 : 100
  },
  date: {
    color: colors.fontSecondary,
    fontSize: 12,
    marginBottom: 10,
    ...fontStyles.normal
  },
  info: {
    flex: 1,
    marginLeft: 15
  },
  address: {
    fontSize: 15,
    color: colors.fontPrimary,
    ...fontStyles.normal
  },
  status: {
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: 5,
    textAlign: 'center',
    backgroundColor: colors.grey000,
    color: colors.grey400,
    fontSize: 9,
    letterSpacing: 0.5,
    width: 75,
    textTransform: 'uppercase',
    ...fontStyles.bold
  },
  amount: {
    fontSize: 15,
    color: colors.fontPrimary,
    ...fontStyles.normal
  },
  amountFiat: {
    fontSize: 12,
    color: colors.fontSecondary,
    textTransform: 'uppercase',
    ...fontStyles.normal
  },
  amounts: {
    flex: 0.6,
    alignItems: 'flex-end'
  },
  subRow: {
    flexDirection: 'row'
  },
  statusConfirmed: {
    backgroundColor: colors.green100,
    color: colors.green500
  },
  statusSubmitted: {
    backgroundColor: colors.orange000,
    color: colors.orange300
  },
  statusFailed: {
    backgroundColor: colors.red000,
    color: colors.red
  },
  ethLogo: {
    width: 24,
    height: 24
  },
  tokenImageStyle: {
    width: 24,
    height: 24,
    borderRadius: 12
  },
  paymentChannelTransactionIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey100,
    borderRadius: 12,
    width: 24,
    height: 24,
    backgroundColor: colors.white
  },
  paymentChannelTransactionDepositIcon: {
    marginTop: 2,
    marginLeft: 1
  },
  paymentChannelTransactionWithdrawIcon: {
    marginBottom: 2,
    marginRight: 1,
    transform: [{ rotate: '180deg' }]
  },
  actionContainerStyle: {
    height: 25,
    width: 70,
    padding: 0
  },
  speedupActionContainerStyle: {
    marginRight: 10
  },
  actionStyle: {
    fontSize: 10,
    padding: 0,
    paddingHorizontal: 10
  },
  transactionActionsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingLeft: 40
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 10
  },
});

const ethLogo = require('../../../images/eth-logo.png'); // eslint-disable-line

/**
 * View that renders a transaction item part of transactions list
 */
class TransactionElement extends React.Component {
  static propTypes = {
		/**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object,
		/**
		 * Asset object (in this case ERC721 token)
		 */
    tx: PropTypes.object,
		/**
		 * Object containing token exchange rates in the format address => exchangeRate
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    contractExchangeRates: PropTypes.object,
		/**
		 * ETH to current currency conversion rate
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    currentCurrency: PropTypes.string,
		/**
		 * String of selected address
		 */
    selectedAddress: PropTypes.string,
		/**
		 * Current element of the list index
		 */
    i: PropTypes.number,
		/**
		 * Callback to render transaction details view
		 */
    onPressItem: PropTypes.func,
		/**
		 * An array that represents the user tokens
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    tokens: PropTypes.object,
		/**
		 * An array that represents the user collectible contracts
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    collectibleContracts: PropTypes.array,
		/**
		 * Current provider ticker
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    ticker: PropTypes.string,
		/**
		 * Current exchange rate
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    exchangeRate: PropTypes.number,
		/**
		 * Callback to speed up tx
		 */
    onSpeedUpAction: PropTypes.func,
		/**
		 * Callback to cancel tx
		 */
    onCancelAction: PropTypes.func,
		/**
		 * A string representing the network name
		 */
    providerType: PropTypes.string,
		/**
		 * Primary currency, either ETH or Fiat
		 */
    // eslint-disable-next-line react/no-unused-prop-types
    primaryCurrency: PropTypes.string
  };

  state = {
    actionKey: undefined,
    cancelIsOpen: false,
    speedUpIsOpen: false,
    detailsModalVisible: false,
    transactionGas: { gasBN: undefined, gasPriceBN: undefined, gasTotal: undefined },
    transactionElement: undefined,
    transactionDetails: undefined
  };

  mounted = false;

  componentDidMount = async () => {
    const [transactionElement, transactionDetails] = await decodeTransaction(this.props);
    this.mounted = true;
    this.mounted && this.setState({ transactionElement, transactionDetails });
  };

  componentWillUnmount() {
    this.mounted = false;
  }

  getStatusStyle(status) {
    if (status === 'confirmed') {
      return styles.statusConfirmed;
    } else if (status === 'submitted' || status === 'approved') {
      return styles.statusSubmitted;
    } else if (status === 'failed') {
      return styles.statusFailed;
    }
    return null;
  }

  onPressItem = () => {
    const { tx, i, onPressItem } = this.props;
    onPressItem(tx.id, i);
    this.setState({ detailsModalVisible: true });
  };

  onCloseDetailsModal = () => {
    this.setState({ detailsModalVisible: false });
  };

  renderTxTime = () => {
    const { tx, selectedAddress } = this.props;
    const incoming = safeToChecksumAddress(tx.transaction.to) === selectedAddress;
    const selfSent = incoming && safeToChecksumAddress(tx.transaction.from) === selectedAddress;
    return (
      <Text style={styles.date}>
        {(!incoming || selfSent) && tx.transaction.nonce && `#${parseInt(tx.transaction.nonce, 16)}  - `}
        {`${toDateFormat(tx.time)}`}
      </Text>
    );
  };

  renderTxElementImage = transactionElement => {
    const {
      renderTo,
      renderFrom,
      actionKey,
      contractDeployment = false,
      paymentChannelTransaction
    } = transactionElement;
    const {
      tx: { networkID }
    } = this.props;
    let logo;

    if (contractDeployment) {
      return (
        <FadeIn>
          <Image source={ethLogo} style={styles.ethLogo} />
        </FadeIn>
      );
    } else if (actionKey === strings('transactions.smart_contract_interaction')) {
      if (renderTo in contractMap) {
        logo = contractMap[renderTo].logo;
      }
      return (
        <TokenImage
          asset={{ address: renderTo, logo }}
          containerStyle={styles.tokenImageStyle}
          iconStyle={styles.tokenImageStyle}
          logoDefined
        />
      );
    } else if (paymentChannelTransaction) {
      const contract = CONTRACTS[networkID];
      const isDeposit = contract && renderTo.toLowerCase() === contract.toLowerCase();
      if (isDeposit) {
        return (
          <FadeIn style={styles.paymentChannelTransactionIconWrapper}>
            <Icon
              // style={styles.paymentChannelTransactionDepositIcon}
              name="down"
              size={16}
              color={colors.green500}
            />
          </FadeIn>
        );
      }
      const isWithdraw = renderFrom === CONTRACTS[networkID];
      if (isWithdraw) {
        return (
          <FadeIn style={styles.paymentChannelTransactionIconWrapper}>
            <Icon
              style={styles.paymentChannelTransactionWithdrawIcon}
              name={'md-arrow-down'}
              size={16}
              color={colors.grey500}
            />
          </FadeIn>
        );
      }
    }
    return <Identicon address={renderTo} diameter={24} />;
  };

	/**
	 * Renders an horizontal bar with basic tx information
	 *
	 * @param {object} transactionElement - Transaction information to render, containing addressTo, actionKey, value, fiatValue, contractDeployment
	 */
  renderTxElement = transactionElement => {
    const {
      tx: {
        status,
        transaction: { to }
      },
      providerType
    } = this.props;
    const { value, fiatValue = false, actionKey } = transactionElement;
    const networkId = Networks[providerType].networkId;
    const renderTxActions = status === 'submitted' || status === 'approved';
    const renderSpeedUpAction = safeToChecksumAddress(to) !== AppConstants.CONNEXT.CONTRACTS[networkId];
    return (
      <View style={styles.rowOnly}>
        {this.renderTxTime()}
        <View style={styles.subRow}>
          {this.renderTxElementImage(transactionElement)}
          <View style={styles.info} numberOfLines={1}>
            <Text numberOfLines={1} style={styles.address}>
              {actionKey}
            </Text>
            <Text style={[styles.status, this.getStatusStyle(status)]}>{status}</Text>
          </View>
          <View style={styles.amounts}>
            <Text style={styles.amount}>{value}</Text>
            <Text style={styles.amountFiat}>{fiatValue}</Text>
          </View>
        </View>
        {!!renderTxActions && (
          <View style={styles.transactionActionsContainer}>
            {renderSpeedUpAction && this.renderSpeedUpButton()}
            {this.renderCancelButton()}
          </View>
        )}
      </View>
    );
  };

  renderCancelButton = () => (
    <Button
      type="warning"
      // style={styles.actionStyle}
      onPress={this.showCancelModal}
    >
      {strings('transaction.cancel')}
    </Button>
  );

  showCancelModal = () => {
    const { tx } = this.props;
    const existingGasPrice = tx.transaction ? tx.transaction.gasPrice : '0x0';
    const existingGasPriceDecimal = parseInt(existingGasPrice === undefined ? '0x0' : existingGasPrice, 16);
    this.mounted && this.props.onCancelAction(true, existingGasPriceDecimal, this.props.tx);
  };

  showSpeedUpModal = () => {
    const { tx } = this.props;
    const existingGasPrice = tx.transaction ? tx.transaction.gasPrice : '0x0';
    const existingGasPriceDecimal = parseInt(existingGasPrice === undefined ? '0x0' : existingGasPrice, 16);
    this.mounted && this.props.onSpeedUpAction(true, existingGasPriceDecimal, this.props.tx);
  };

  hideSpeedUpModal = () => {
    this.mounted && this.props.onSpeedUpAction(false);
  };

  renderSpeedUpButton = () => (
    <Button
      type="primary"
      onPress={this.showSpeedUpModal}
    >
      {strings('transaction.speedup')}
    </Button>
  );

  render() {
    const { tx } = this.props;
    const { detailsModalVisible, transactionElement, transactionDetails } = this.state;

    if (!transactionElement || !transactionDetails) return <View />;
    return (
      <View>
        <TouchableHighlight
          style={styles.row}
          onPress={this.onPressItem}
          underlayColor={colors.grey000}
          activeOpacity={1}
        >
          <View style={styles.rowContent}>{this.renderTxElement(transactionElement)}</View>
        </TouchableHighlight>
        <Modal
          visible={detailsModalVisible}
          title={transactionElement.actionKey}
          closable
          transparent
          maskClosable
          onClose={this.onCloseDetailsModal}
          onBackdropPress={this.onCloseDetailsModal}
          onBackButtonPress={this.onCloseDetailsModal}
          onSwipeComplete={this.onCloseDetailsModal}
        >
          <View style={styles.modalContainer}>
            <TransactionDetails
              transactionObject={tx}
              transactionDetails={transactionDetails}
              navigation={this.props.navigation}
              close={this.onCloseDetailsModal}
            />
          </View>
        </Modal>
      </View>
    );
  }
}


export default inject(({ store: state }) => ({
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  providerType: state.engine.backgroundState.NetworkController.provider.type,
  primaryCurrency: state.settings.primaryCurrency

}))(observer(TransactionElement))
