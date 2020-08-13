import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Image, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { List, Icon, ActionSheet } from '@ant-design/react-native';
import { inject, observer } from 'mobx-react';
import TokenImage from '../TokenImage';
import { colors, fontStyles } from '../../../styles/common';
import contractMap from 'eth-contract-metadata';
import { renderFromTokenMinimalUnit, balanceToFiat } from '../../../utils/number';
import FadeIn from 'react-native-fade-in-image';
import { safeToChecksumAddress } from '../../../utils/address';
import { strings } from '../../../locales/i18n';
import Engine from '../../../modules/metamask/core/Engine';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1,
    minHeight: 500
  },
  emptyView: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  text: {
    fontSize: 20,
    color: colors.fontTertiary,
    ...fontStyles.normal
  },
  add: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addText: {
    fontSize: 15,
    color: colors.blue,
    ...fontStyles.normal
  },
  footer: {
    flex: 1,
    paddingBottom: 30
  },
  balances: {
    flex: 1,
    justifyContent: 'center'
  },
  balance: {
    fontSize: 16,
    color: colors.fontPrimary,
    ...fontStyles.normal,
    textTransform: 'uppercase'
  },
  balanceFiat: {
    fontSize: 12,
    color: colors.fontSecondary,
    ...fontStyles.normal,
    textTransform: 'uppercase'
  },
  ethLogo: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    marginRight: 20
  }
});

const ethLogo = require('../../../images/eth-logo.png'); // eslint-disable-line

/**
 * View that renders a list of ERC-20 Tokens
 */
class Tokens extends React.Component {
  static propTypes = {
		/**
		 * Navigation object required to push
		 * the Asset detail view
		 */
    navigation: PropTypes.object,
		/**
		 * Array of assets (in this case ERC20 tokens)
		 */
    tokens: PropTypes.array,
		/**
		 * ETH to current currency conversion rate
		 */
    conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
    currentCurrency: PropTypes.string,
		/**
		 * Object containing token balances in the format address => balance
		 */
    tokenBalances: PropTypes.object,
		/**
		 * Object containing token exchange rates in the format address => exchangeRate
		 */
    tokenExchangeRates: PropTypes.object,
		/**
		 * Array of transactions
		 */
    transactions: PropTypes.array,
		/**
		 * Primary currency, either ETH or Fiat
		 */
    primaryCurrency: PropTypes.string
  };

  actionSheet = null;

  tokenToRemove = null;

  renderEmpty = () => (
    <View style={styles.emptyView}>
      <Text style={styles.text}>{strings('wallet.no_tokens')}</Text>
    </View>
  );

  onItemPress = token => {
    this.props.navigation.navigate('Asset', { ...token, transactions: this.props.transactions });
  };

  renderFooter = () => (
    <View style={styles.footer} key={'tokens-footer'}>
      <TouchableOpacity style={styles.add} onPress={this.goToAddToken} testID={'add-token-button'}>
        <Icon name="plus" size={16} color={colors.blue} />
        <Text style={styles.addText}>{strings('wallet.add_tokens')}</Text>
      </TouchableOpacity>
    </View>
  );

  renderItem = asset => {
    const { conversionRate, currentCurrency, tokenBalances, tokenExchangeRates, primaryCurrency } = this.props;
    const itemAddress = safeToChecksumAddress(asset.address);
    const logo = asset.logo || ((contractMap[itemAddress] && contractMap[itemAddress].logo) || undefined);
    const exchangeRate = itemAddress in tokenExchangeRates ? tokenExchangeRates[itemAddress] : undefined;
    const balance =
      asset.balance ||
      (itemAddress in tokenBalances ? renderFromTokenMinimalUnit(tokenBalances[itemAddress], asset.decimals) : 0);
    const balanceFiat = asset.balanceFiat || balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency);
    const balanceValue = `${balance} ${asset.symbol}`;

    // render balances according to primary currency
    let mainBalance, secondaryBalance;
    if (primaryCurrency === 'ETH') {
      mainBalance = balanceValue;
      secondaryBalance = balanceFiat;
    } else {
      mainBalance = !balanceFiat ? balanceValue : balanceFiat;
      secondaryBalance = !balanceFiat ? balanceFiat : balanceValue;
    }

    asset = { ...asset, ...{ logo, balance, balanceFiat } };
    return (
      <List.Item
        key={asset.address || '0x'}
        arrow="horizontal"
        onLongPress={asset.isETH ? null : () => {
          this.showRemoveMenu(asset)
        }}
        thumb={asset.isETH ? (
          <FadeIn placeholderStyle={{ backgroundColor: colors.white }}>
            <Image source={ethLogo} resizeMode="contain" style={styles.ethLogo} />
          </FadeIn>
        ) : (
            <TokenImage asset={asset} containerStyle={styles.ethLogo} />
          )}
        extra=""
        onPress={() => {
          this.onItemPress(asset)
        }}>
        {mainBalance}
        <List.Item.Brief> {secondaryBalance ? secondaryBalance : ''}</List.Item.Brief>
      </List.Item>
    )
  };

  renderList() {
    const { tokens } = this.props;

    return (
      <>
        <List>
          {tokens.map(item => this.renderItem(item))}
        </List>
        {this.renderFooter()}
      </>
    );
  }

  goToAddToken = () => {
    this.props.navigation.push('AddAsset', { assetType: 'token' });
  };

  showRemoveMenu = token => {
    this.tokenToRemove = token;
    this.showActionSheet()
  };

  removeToken = () => {
    const { AssetsController } = Engine.context;
    AssetsController.removeAndIgnoreToken(this.tokenToRemove.address);
    Alert.alert(strings('wallet.token_removed_title'), strings('wallet.token_removed_desc'));
  };

  createActionSheetRef = ref => {
    this.actionSheet = ref;
  };

  onActionSheetPress = index => (index === 0 ? this.removeToken() : null);

  showActionSheet = () => {
    const BUTTONS = [
      strings('wallet.remove'),
      strings('wallet.cancel'),
    ];
    ActionSheet.showActionSheetWithOptions(
      {
        title: strings('wallet.remove_token_title'),
        // message: '',
        options: BUTTONS,
        cancelButtonIndex: 1,
        destructiveButtonIndex: 0,
      },
      buttonIndex => {
        // console.log(buttonIndex)
        this.onActionSheetPress(buttonIndex);
      }
    );
  }

  render = () => {
    const { tokens } = this.props;
    return (
      <View style={styles.wrapper}>
        {tokens && tokens.length ? this.renderList() : this.renderEmpty()}
      </View>
    );
  };
}

export default inject(({ store: state }) => ({
  currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
  conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
  primaryCurrency: state.settings.primaryCurrency,
  tokenBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
  tokenExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates

}))(observer(Tokens))
