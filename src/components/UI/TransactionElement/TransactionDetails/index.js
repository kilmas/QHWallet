import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react'
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Button } from '@ant-design/react-native';
import { colors, fontStyles, baseStyles } from '../../../../styles/common';
import NetworkList, {
  getNetworkTypeById,
  findBlockExplorerForRpc,
  getBlockExplorerName
} from '../../../../utils/networks';
import { getEtherscanTransactionUrl, getEtherscanBaseUrl } from '../../../../utils/etherscan';
import URL from 'url-parse';
import EthereumAddress from '../../EthereumAddress';
import TransactionSummary from '../../../TransactionSummary';
import { toDateFormat } from '../../../../utils/date';
import { safeToChecksumAddress } from '../../../../utils/address';
import { strings } from '../../../../locales/i18n';
import AppConstants from '../../../../modules/metamask/core/AppConstants';

const styles = StyleSheet.create({
  detailRowWrapper: {
    paddingHorizontal: 5
  },
  detailRowTitle: {
    fontSize: 10,
    color: colors.grey500,
    marginBottom: 8,
    ...fontStyles.normal
  },
  flexRow: {
    flexDirection: 'row'
  },
  section: {
    paddingVertical: 16
  },
  sectionBorderBottom: {
    borderBottomColor: colors.grey100,
    borderBottomWidth: 1
  },
  flexEnd: {
    flex: 1,
    alignItems: 'flex-end'
  },
  textUppercase: {
    textTransform: 'uppercase'
  },
  detailRowText: {
    fontSize: 12,
    color: colors.fontPrimary,
    ...fontStyles.normal
  },
  viewOnEtherscan: {
    fontSize: 16,
    color: colors.blue,
    ...fontStyles.normal,
    textAlign: 'center'
  },
  touchableViewOnEtherscan: {
    marginVertical: 24
  },
  summaryWrapper: {
    marginVertical: 8
  },
  statusText: {
    fontSize: 11,
    ...fontStyles.normal
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
    minWidth: 110,
  },
  transactionActionsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    justifyContent: 'space-around'
  }
});

const NO_RPC_BLOCK_EXPLORER = 'NO_BLOCK_EXPLORER';

/**
 * View that renders a transaction details as part of transactions list
 */
class TransactionDetails extends React.Component {
  static propTypes = {
		/**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object,
		/**
		 * Object representing the selected the selected network
		 */
    network: PropTypes.object,
		/**
		 * Object corresponding to a transaction, containing transaction object, networkId and transaction hash string
		 */
    transactionObject: PropTypes.object,
		/**
		 * Object with information to render
		 */
    transactionDetails: PropTypes.object,
		/**
		 * Frequent RPC list from PreferencesController
		 */
    frequentRpcList: PropTypes.array,
		/**
		 * Callback to close the view
		 */
    close: PropTypes.func,
		/**
		 * A string representing the network name
		 */
    providerType: PropTypes.string,
    showSpeedUpModal: PropTypes.func,
    showCancelModal: PropTypes.func
  };

  state = {
    rpcBlockExplorer: undefined,
    renderTxActions: true
  };

  componentDidMount = () => {
    const {
      network: {
        provider: { rpcTarget, type }
      },
      frequentRpcList
    } = this.props;
    let blockExplorer;
    if (type === 'rpc') {
      blockExplorer = findBlockExplorerForRpc(rpcTarget, frequentRpcList) || NO_RPC_BLOCK_EXPLORER;
    }
    this.setState({ rpcBlockExplorer: blockExplorer });
  };

  viewOnEtherscan = () => {
    const {
      transactionObject: { networkID },
      transactionDetails: { transactionHash },
      network: {
        provider: { type }
      },
      close
    } = this.props;
    const { rpcBlockExplorer } = this.state;
    try {
      if (type === 'rpc') {
        const url = `${rpcBlockExplorer}/tx/${transactionHash}`;
        const title = new URL(rpcBlockExplorer).hostname;
        this.props.navigation.push('Webview', {
          url,
          title
        });
      } else {
        const network = getNetworkTypeById(networkID);
        const url = getEtherscanTransactionUrl(network, transactionHash);
        const etherscan_url = getEtherscanBaseUrl(network).replace('https://', '');
        this.props.navigation.push('Webview', {
          url,
          title: etherscan_url
        });
      }
      close && close();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e, { message: `can't get a block explorer link for network `, networkID });
    }
  };

  renderStatusText = status => {
    status = status && status.charAt(0).toUpperCase() + status.slice(1);
    switch (status) {
      case 'Confirmed':
        return <Text style={[styles.statusText, { color: colors.green400 }]}>{status}</Text>;
      case 'Pending':
      case 'Submitted':
        return <Text style={[styles.statusText, { color: colors.orange }]}>{status}</Text>;
      case 'Failed':
      case 'Cancelled':
        return <Text style={[styles.statusText, { color: colors.red }]}>{status}</Text>;
    }
  };

  renderSpeedUpButton = () => (
    <Button
      type="primary"
      // containerStyle={[styles.actionContainerStyle, styles.speedupActionContainerStyle]}
      style={styles.actionStyle}
      onPress={this.props.showSpeedUpModal}
    >
      {strings('transaction.speedup')}
    </Button>
  );

  renderCancelButton = () => (
    <Button
      type="warning"
      // containerStyle={styles.actionContainerStyle}
      style={styles.actionStyle}
      onPress={this.props.showCancelModal}
    >
      {strings('transaction.cancel')}
    </Button>
  );

  render() {
    const {
      transactionObject,
      transactionObject: {
        status,
        time,
        transaction: { nonce, to }
      },
      providerType
    } = this.props;
    const networkId = NetworkList[providerType].networkId;
    const renderTxActions = status === 'submitted' || status === 'approved';
    const renderSpeedUpAction = safeToChecksumAddress(to) !== AppConstants.CONNEXT.CONTRACTS[networkId];
    const { rpcBlockExplorer } = this.state;
    return (
      <View style={styles.detailRowWrapper}>
        <View style={[styles.section, styles.flexRow, styles.sectionBorderBottom]}>
          <View style={[baseStyles.flexGrow, styles.flexRow]}>
            <View style={baseStyles.flexRow}>
              <Text style={styles.detailRowTitle}>{strings('transactions.status')}</Text>
              {this.renderStatusText(status)}
            </View>
            <View style={styles.flexEnd}>
              <Text style={styles.detailRowTitle}>{strings('transactions.date')}</Text>
              <Text style={styles.statusText}>{toDateFormat(time)}</Text>
            </View>
          </View>
        </View>
        {!!renderTxActions && (
          <View style={styles.transactionActionsContainer}>
            {renderSpeedUpAction && this.renderSpeedUpButton()}
            {this.renderCancelButton()}
          </View>
        )}
        <View style={[styles.section, styles.flexRow, !!nonce && styles.sectionBorderBottom]}>
          <View style={[baseStyles.flexGrow, styles.flexRow]}>
            <View style={baseStyles.flexRow}>
              <Text style={styles.detailRowTitle}>{strings('transactions.from')}</Text>
              <EthereumAddress
                type="short"
                style={styles.detailRowText}
                address={this.props.transactionDetails.renderFrom}
              />
            </View>
            <View style={styles.flexEnd}>
              <Text style={styles.detailRowTitle}>{strings('transactions.to')}</Text>
              <EthereumAddress
                type="short"
                style={styles.detailRowText}
                address={this.props.transactionDetails.renderTo}
              />
            </View>
          </View>
        </View>
        {!!nonce && (
          <View style={styles.section}>
            <Text style={[styles.detailRowTitle, styles.textUppercase]}>
              {strings('transactions.nonce')}
            </Text>
            <Text style={[styles.detailRowText]}>{`#${parseInt(nonce.replace(/^#/, ''), 16)}`}</Text>
          </View>
        )}
        <View style={[styles.summaryWrapper, !nonce && styles.touchableViewOnEtherscan]}>
          <TransactionSummary
            amount={this.props.transactionDetails.summaryAmount}
            fee={this.props.transactionDetails.summaryFee}
            totalAmount={this.props.transactionDetails.summaryTotalAmount}
            secondaryTotalAmount={this.props.transactionDetails.summarySecondaryTotalAmount}
            gasEstimationReady
          />
        </View>

        {this.props.transactionDetails.transactionHash &&
          transactionObject.status !== 'cancelled' &&
          rpcBlockExplorer !== NO_RPC_BLOCK_EXPLORER && (
            <TouchableOpacity onPress={this.viewOnEtherscan} style={styles.touchableViewOnEtherscan}>
              <Text style={styles.viewOnEtherscan}>
                {(rpcBlockExplorer &&
                  `${strings('transactions.view_on')} ${getBlockExplorerName(rpcBlockExplorer)}`) ||
                  strings('transactions.view_on_etherscan')}
              </Text>
            </TouchableOpacity>
          )}
      </View>
    );
  };
}

export default inject(({ store: state }) => ({
  network: state.engine.backgroundState.NetworkController,
  frequentRpcList: state.engine.backgroundState.PreferencesController.frequentRpcList,
  providerType: state.engine.backgroundState.NetworkController.provider.type

}))(observer(TransactionDetails))

