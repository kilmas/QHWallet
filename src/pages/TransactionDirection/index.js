import React from 'react';
import { StyleSheet, Text, View, PixelRatio } from 'react-native';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Icon } from '@ant-design/react-native';
import contractMap from 'eth-contract-metadata';
import { colors, fontStyles } from '../../styles/common';
import { safeToChecksumAddress, renderAccountName } from '../../utils/address';
import { getNormalizedTxState } from '../../utils/transactions';
import Identicon from '../../components/UI/Identicon';
import AssetIcon from '../../components/UI/AssetIcon';
import { strings } from '../../locales/i18n';

const FONT_SIZE = PixelRatio.get() < 2 ? 12 : 16;

const styles = StyleSheet.create({
  graphic: {
    borderBottomWidth: 1,
    borderColor: colors.grey100,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0
  },
  arrow: {
    backgroundColor: colors.white,
    borderColor: colors.grey200,
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    width: 30,
    marginTop: -15,
    marginLeft: -15,
    left: '50%',
    position: 'absolute',
    zIndex: 1,
    alignSelf: 'center'
  },
  arrowIcon: {
    color: colors.grey400,
    marginLeft: 3,
    marginTop: 3
  },
  fromGraphic: {
    borderColor: colors.grey100,
    borderRightWidth: 1,
    paddingRight: 35,
    paddingLeft: 24
  },
  addressText: {
    ...fontStyles.normal,
    color: colors.black,
    marginHorizontal: 8
  },
  addressGraphic: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 42,
    width: '50%',
    flex: 1
  },
  toGraphic: {
    paddingRight: 20,
    paddingLeft: 35
  },
  ensRecipientContainer: {
    flex: 1,
    marginLeft: 9
  },
  ensRecipient: {
    ...fontStyles.bold,
    color: colors.black,
    fontSize: FONT_SIZE
  },
  ensAddress: {
    ...fontStyles.normal,
    color: colors.black,
    fontSize: 10
  },
  addressWrapper: { flex: 1 },
  contractLogo: {
    height: 24,
    width: 24,
    backgroundColor: colors.white
  },
  contractLogoWrapper: {
    backgroundColor: colors.white,
    alignItems: 'flex-start'
  }
});

/**
 * PureComponent that renders transaction to and from
 */
class TransactionDirection extends React.Component {

  static propTypes = {
		/**
		/* Identities object required to get account name
		*/
    identities: PropTypes.object,
		/**
		 * Transaction state
		 */
    transaction: PropTypes.object.isRequired
  };

  state = {};

  renderToAddressDirection = () => {
    const {
      transaction: { to, ensRecipient },
      identities
    } = this.props;
    let child;
    if (ensRecipient) {
      child = (
        <View style={styles.ensRecipientContainer}>
          <Text style={styles.ensRecipient} numberOfLines={1}>
            {ensRecipient}
          </Text>
          <Text style={styles.ensAddress} numberOfLines={1}>
            {renderAccountName(to, identities)}
          </Text>
        </View>
      );
    } else if (to) {
      child = (
        <Text style={[styles.addressText, styles.addressWrapper]} numberOfLines={1}>
          {renderAccountName(to, identities)}
        </Text>
      );
    } else {
      child = (
        <Text style={[styles.addressText, styles.addressWrapper]} numberOfLines={1}>
          {strings('transactions.to_contract')}
        </Text>
      );
    }
    return (
      <View style={[styles.addressGraphic, styles.toGraphic]}>
        {to ? <Identicon address={to} diameter={18} /> : <Icon name="file-text-o" size={18} />}
        {child}
      </View>
    );
  };

  renderToContractDirection = contract => (
    <View style={[styles.addressGraphic, styles.toGraphic]}>
      <View style={styles.contractLogoWrapper}>
        <AssetIcon logo={contract.logo} customStyle={styles.contractLogo} />
      </View>
      <Text style={[styles.addressText, styles.addressWrapper]} numberOfLines={1}>
        {contract.name}
      </Text>
    </View>
  );

  render() {
    const {
      transaction: { from, to },
      identities
    } = this.props;
    const contract = contractMap[safeToChecksumAddress(to)];
    return (
      <View style={styles.graphic}>
        <View style={[styles.addressGraphic, styles.fromGraphic]}>
          <Identicon address={from} diameter={18} />
          <Text style={styles.addressText} numberOfLines={1}>
            {renderAccountName(from, identities)}
          </Text>
        </View>
        <View style={styles.arrow}>
          <Icon name='arrow-right' size={22} style={styles.arrowIcon} />
        </View>
        {contract === undefined ? this.renderToAddressDirection() : this.renderToContractDirection(contract)}
      </View>
    );
  };
}



export default inject(({ store: state }) => ({
  identities: state.engine.backgroundState.PreferencesController.identities,
  transaction: getNormalizedTxState(state)
}))(observer(TransactionDirection))
