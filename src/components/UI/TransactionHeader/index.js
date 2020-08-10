import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { Icon } from '@ant-design/react-native';
import { inject, observer } from 'mobx-react';
import { colors, fontStyles } from '../../../styles/common';
import WebsiteIcon from '../WebsiteIcon';
import { getHost, getUrlObj } from '../../../utils/browser';
import networkList from '../../../utils/networks';

const styles = StyleSheet.create({
  transactionHeader: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  domainLogo: {
    width: 56,
    height: 56,
    borderRadius: 32
  },
  assetLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10
  },
  domanUrlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10
  },
  secureIcon: {
    marginRight: 5
  },
  domainUrl: {
    ...fontStyles.bold,
    textAlign: 'center',
    fontSize: 14,
    color: colors.black
  },
  networkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  networkStatusIndicator: {
    borderRadius: 2.5,
    height: 5,
    width: 5
  },
  network: {
    ...fontStyles.normal,
    textAlign: 'center',
    fontSize: 12,
    padding: 5,
    color: colors.black,
    textTransform: 'capitalize'
  }
});

/**
 * React.Component that renders the transaction header used for signing, granting permissions and sending
 */
class TransactionHeader extends React.Component {
  static propTypes = {
		/**
		 * Object containing current page title and url
		 */
    currentPageInformation: PropTypes.object,
		/**
		 * String representing the selected network
		 */
    networkType: PropTypes.string,
		/**
		 * Object representing the status of infura networks
		 */
    networkStatus: PropTypes.object
  };

	/**
	 * Returns a small circular indicator, red if the current selected network is offline, green if it's online.
	 *=
	 * @return {element} - JSX view element
	 */
  renderNetworkStatusIndicator = () => {
    const { networkType, networkStatus } = this.props;
    const networkStatusIndicatorColor = networkStatus[networkType] === 'ok' ? 'green' : 'red';
    const networkStatusIndicator = (
      <View style={[styles.networkStatusIndicator, { backgroundColor: networkStatusIndicatorColor }]} />
    );
    return networkStatusIndicator;
  };

	/**
	 * Returns a secure icon next to the dApp URL. Lock for https protocol, warning sign otherwise.
	 *=
	 * @return {element} - JSX image element
	 */
  renderSecureIcon = () => {
    const { url } = this.props.currentPageInformation;
    const secureIcon =
      getUrlObj(url).protocol === 'https:' ? (
        <Icon name={'lock'} size={15} style={styles.secureIcon} />
      ) : (
          <Icon name={'warning'} size={15} style={styles.secureIcon} />
        );
    return secureIcon;
  };

  render() {
    const {
      currentPageInformation: { url },
      networkType
    } = this.props;
    const title = getHost(url);
    const networkName = networkList[networkType].shortName;
    return (
      <View style={styles.transactionHeader}>
        <WebsiteIcon style={styles.domainLogo} viewStyle={styles.assetLogo} title={title} url={url} />
        <View style={styles.domanUrlContainer}>
          {this.renderSecureIcon()}
          <Text style={styles.domainUrl}>{title}</Text>
        </View>
        <View style={styles.networkContainer}>
          {this.renderNetworkStatusIndicator()}
          <Text style={styles.network}>{networkName}</Text>
        </View>
      </View>
    );
  }
}

export default inject(({ store: state }) => ({
  networkType: state.engine.backgroundState.NetworkController.provider.type,
  networkStatus: state.engine.backgroundState.NetworkStatusController.networkStatus.infura
}))(observer(TransactionHeader))