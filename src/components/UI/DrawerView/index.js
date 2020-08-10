import React, { PureComponent } from 'react';
import {
  Alert,
  Linking,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  Text,
  ScrollView,
  InteractionManager
} from 'react-native';
import { inject, observer } from 'mobx-react';
import Clipboard from '@react-native-community/clipboard';
import PropTypes from 'prop-types';
import Share from 'react-native-share';
import { Icon, Button, Toast } from '@ant-design/react-native';
import { colors, fontStyles } from '../../../styles/common';
import { hasBlockExplorer, findBlockExplorerForRpc, getBlockExplorerName } from '../../../utils/networks';
import Identicon from '../Identicon';
import AccountList from '../AccountList';
import NetworkList from '../NetworkList';
import { renderFromWei, renderFiat } from '../../../utils/number';
import { DrawerActions } from 'react-navigation-drawer'; // eslint-disable-line
import Modal from 'react-native-modal';
// import { toggleNetworkModal, toggleAccountsModal, toggleReceiveModal } from '../../../actions/modals';
import { getEtherscanAddressUrl, getEtherscanBaseUrl } from '../../../util/etherscan';
import Engine from '../../../core/Engine';
import findFirstIncomingTransaction from '../../../util/accountSecurity';
import { getVersion, getBuildNumber, getSystemName, getApiLevel, getSystemVersion } from 'react-native-device-info';
import Device from '../../../util/Device';
import OnboardingWizard from '../OnboardingWizard';
import ReceiveRequest from '../ReceiveRequest';
import URL from 'url-parse';
import { generateUniversalLinkAddress } from '../../../utilS/payment-link-generator';
import EthereumAddress from '../EthereumAddress';
// eslint-disable-next-line import/named
import { NavigationActions } from 'react-navigation';
import { getEther } from '../../../utils/transactions';
// import { newAssetTransaction } from '../../../actions/transaction';
import { strings } from '../../../locales/i18n';
import AppConstants from '../../../modules/metamask/core/AppConstants';
import SecureKeychain from '../../../modules/metamask/core/SecureKeychain';

const ANDROID_OFFSET = 30;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white
  },
  header: {
    paddingTop: Device.isIphoneX() ? 60 : 24,
    backgroundColor: colors.grey000,
    height: Device.isIphoneX() ? 110 : 74,
    flexDirection: 'column',
    paddingBottom: 0
  },
  metamaskLogo: {
    flexDirection: 'row',
    flex: 1,
    marginTop: Device.isAndroid() ? 0 : 12,
    marginLeft: 15,
    paddingTop: Device.isAndroid() ? 10 : 0
  },
  metamaskFox: {
    height: 27,
    width: 27,
    marginRight: 15
  },
  metamaskName: {
    marginTop: 4,
    width: 90,
    height: 18
  },
  account: {
    flex: 1,
    backgroundColor: colors.grey000
  },
  accountBgOverlay: {
    borderBottomColor: colors.grey100,
    borderBottomWidth: 1,
    padding: 17
  },
  identiconWrapper: {
    marginBottom: 12,
    width: 56,
    height: 56
  },
  identiconBorder: {
    borderRadius: 96,
    borderWidth: 2,
    padding: 2,
    borderColor: colors.blue
  },
  accountNameWrapper: {
    flexDirection: 'row',
    paddingRight: 17
  },
  accountName: {
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 5,
    color: colors.fontPrimary,
    ...fontStyles.normal
  },
  caretDown: {
    textAlign: 'right',
    marginLeft: 7,
    marginTop: 3,
    fontSize: 18,
    color: colors.fontPrimary
  },
  accountBalance: {
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 5,
    color: colors.fontPrimary,
    ...fontStyles.normal
  },
  accountAddress: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.fontSecondary,
    ...fontStyles.normal
  },
  buttons: {
    flexDirection: 'row',
    borderBottomColor: colors.grey100,
    borderBottomWidth: 1,
    padding: 15
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 30,
    borderWidth: 1.5
  },
  leftButton: {
    marginRight: 5
  },
  rightButton: {
    marginLeft: 5
  },
  buttonText: {
    marginLeft: Device.isIos() ? 8 : 28,
    marginTop: Device.isIos() ? 0 : -23,
    paddingBottom: Device.isIos() ? 0 : 3,
    fontSize: 15,
    color: colors.blue,
    ...fontStyles.normal
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  buttonIcon: {
    marginTop: 0
  },
  buttonReceive: {
    transform: Device.isIos()
      ? [{ rotate: '90deg' }]
      : [{ rotate: '90deg' }, { translateX: ANDROID_OFFSET }, { translateY: ANDROID_OFFSET }]
  },
  menu: {},
  noTopBorder: {
    borderTopWidth: 0
  },
  menuSection: {
    borderTopWidth: 1,
    borderColor: colors.grey100,
    paddingVertical: 10
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    paddingLeft: 17
  },
  selectedRoute: {
    backgroundColor: colors.blue000,
    marginRight: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20
  },
  selectedName: {
    color: colors.blue
  },
  menuItemName: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 2,
    fontSize: 16,
    color: colors.grey400,
    ...fontStyles.normal
  },
  noIcon: {
    paddingLeft: 0
  },
  menuItemIconImage: {
    width: 22,
    height: 22
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    flexDirection: 'column'
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    ...fontStyles.normal
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: 'center',
    ...fontStyles.bold
  },
  secureModalText: {
    textAlign: 'center',
    fontSize: 13,
    ...fontStyles.normal
  },
  bold: {
    ...fontStyles.bold
  },
  secureModalImage: {
    width: 100,
    height: 100
  },
  importedWrapper: {
    marginTop: 10,
    width: 73,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.grey400
  },
  importedText: {
    color: colors.grey400,
    fontSize: 10,
    ...fontStyles.bold
  },
  instapayLogo: {
    width: 24,
    height: 24
  }
});

const metamask_name = require('../../../images/metamask-name.png'); // eslint-disable-line
const metamask_fox = require('../../../images/fox.png'); // eslint-disable-line
const ICON_IMAGES = {
  wallet: require('../../../images/wallet-icon.png'),
  'selected-wallet': require('../../../images/selected-wallet-icon.png')
};
const drawerBg = require('../../../images/drawer-bg.png'); // eslint-disable-line
const instapay_logo_selected = require('../../../images/mm-instapay-selected.png'); // eslint-disable-line
const instapay_logo = require('../../../images/mm-instapay.png'); // eslint-disable-line

const USE_EXTERNAL_LINKS = Device.isAndroid() || false;

/**
 * View component that displays the MetaMask fox
 * in the middle of the screen
 */
class DrawerView extends PureComponent {
  static propTypes = {
		/**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object,
		/**
		 * Object representing the selected the selected network
		 */
    network: PropTypes.object.isRequired,
		/**
		 * Selected address as string
		 */
    selectedAddress: PropTypes.string,
		/**
		 * List of accounts from the AccountTrackerController
		 */
    accounts: PropTypes.object,
		/**
		 * List of accounts from the PreferencesController
		 */
    identities: PropTypes.object,
		/**
		/* Selected currency
		*/
    currentCurrency: PropTypes.string,
		/**
		 * List of keyrings
		 */
    keyrings: PropTypes.array,
		/**
		 * Action that toggles the network modal
		 */
    toggleNetworkModal: PropTypes.func,
		/**
		 * Action that toggles the accounts modal
		 */
    toggleAccountsModal: PropTypes.func,
		/**
		 * Action that toggles the receive modal
		 */
    toggleReceiveModal: PropTypes.func,


		/**
		 * Boolean that determines the status of the networks modal
		 */
    networkModalVisible: PropTypes.bool.isRequired,
		/**
		 * Boolean that determines the status of the receive modal
		 */
    receiveModalVisible: PropTypes.bool.isRequired,
		/**
		 * Start transaction with asset
		 */
    newAssetTransaction: PropTypes.func.isRequired,
		/**
		 * Boolean that determines the status of the networks modal
		 */
    accountsModalVisible: PropTypes.bool.isRequired,
		/**
		 * Boolean that determines if the user has set a password before
		 */
    passwordSet: PropTypes.bool,
		/**
		 * Wizard onboarding state
		 */
    wizard: PropTypes.object,
		/**
		 * Current provider ticker
		 */
    ticker: PropTypes.string,
		/**
		 * Frequent RPC list from PreferencesController
		 */
    frequentRpcList: PropTypes.array,
		/**
		/* flag that determines the state of payment channels
		*/
    paymentChannelsEnabled: PropTypes.bool,
		/**
		 * Current provider type
		 */
    providerType: PropTypes.string
  };

  state = {
    submitFeedback: false,
    showSecureWalletModal: false
  };

  browserSectionRef = React.createRef();

  currentBalance = null;
  previousBalance = null;
  processedNewBalance = false;
  animatingReceiveModal = false;
  animatingNetworksModal = false;
  animatingAccountsModal = false;

  isCurrentAccountImported() {
    let ret = false;
    const { keyrings, selectedAddress } = this.props;
    const allKeyrings = keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings;
    for (const keyring of allKeyrings) {
      if (keyring.accounts.includes(selectedAddress)) {
        ret = keyring.type !== 'HD Key Tree';
        break;
      }
    }

    return ret;
  }

  componentDidUpdate() {
    setTimeout(async () => {
      if (
        !this.isCurrentAccountImported() &&
        !this.props.passwordSet &&
        !this.processedNewBalance &&
        this.currentBalance >= this.previousBalance &&
        this.currentBalance > 0
      ) {
        const { selectedAddress, network } = this.props;

        const incomingTransaction = await findFirstIncomingTransaction(network.provider.type, selectedAddress);
        if (incomingTransaction) {
          this.processedNewBalance = true;
          // We need to wait for the notification to dismiss
          // before attempting to show the secure wallet modal
          setTimeout(() => {
            this.setState({ showSecureWalletModal: true });
          }, 8000);
        }
      }
    }, 1000);
  }

  toggleAccountsModal = () => {
    if (!this.animatingAccountsModal) {
      this.animatingAccountsModal = true;
      this.props.toggleAccountsModal();
      setTimeout(() => {
        this.animatingAccountsModal = false;
      }, 500);
    }
  };

  toggleReceiveModal = () => {
    if (!this.animatingReceiveModal) {
      this.animatingReceiveModal = true;
      this.props.toggleReceiveModal();
      setTimeout(() => {
        this.animatingReceiveModal = false;
      }, 500);
    }
  };

  onNetworksModalClose = async manualClose => {
    this.toggleNetworksModal();
    if (!manualClose) {
      await this.hideDrawer();
    }
  };

  toggleNetworksModal = () => {
    if (!this.animatingNetworksModal) {
      this.animatingNetworksModal = true;
      this.props.toggleNetworkModal();
      setTimeout(() => {
        this.animatingNetworksModal = false;
      }, 500);
    }
  };

  showReceiveModal = () => {
    this.toggleReceiveModal();
  };


  onReceive = () => {
    this.toggleReceiveModal();
  };

  onSend = async () => {
    this.props.newAssetTransaction(getEther());
    this.props.navigation.navigate('SendFlowView');
    this.hideDrawer();
  };

  goToBrowser = () => {
    this.props.navigation.navigate('BrowserTabHome');
    this.hideDrawer();
  };

  goToPaymentChannel = () => {
    const { providerType } = this.props;
    if (AppConstants.CONNEXT.SUPPORTED_NETWORKS.indexOf(providerType) !== -1) {
      this.props.navigation.navigate('PaymentChannelHome');
    } else {
      Alert.alert(
        strings('experimental_settings.network_not_supported'),
        strings('experimental_settings.switch_network')
      );
    }
    this.hideDrawer();
  };

  showWallet = () => {
    this.props.navigation.navigate('WalletTabHome');
    this.hideDrawer();
  };

  goToTransactionHistory = () => {
    this.props.navigation.navigate('TransactionsHome');
    this.hideDrawer();
  };

  showSettings = async () => {
    this.props.navigation.navigate('SettingsView');
    this.hideDrawer();
  };

  logout = () => {
    const { passwordSet } = this.props;
    Alert.alert(
      strings('drawer.logout_title'),
      '',
      [
        {
          text: strings('drawer.logout_cancel'),
          onPress: () => null,
          style: 'cancel'
        },
        {
          text: strings('drawer.logout_ok'),
          onPress: async () => {
            await SecureKeychain.resetGenericPassword();
            if (!passwordSet) {
              this.props.navigation.navigate(
                'OnboardingRootNav',
                {},
                NavigationActions.navigate({ routeName: 'Onboarding' })
              );
            } else {
              this.props.navigation.navigate('Login');
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  viewInEtherscan = () => {
    const {
      selectedAddress,
      network,
      network: {
        provider: { rpcTarget }
      },
      frequentRpcList
    } = this.props;
    if (network.provider.type === 'rpc') {
      const blockExplorer = findBlockExplorerForRpc(rpcTarget, frequentRpcList);
      const url = `${blockExplorer}/address/${selectedAddress}`;
      const title = new URL(blockExplorer).hostname;
      this.goToBrowserUrl(url, title);
    } else {
      const url = getEtherscanAddressUrl(network.provider.type, selectedAddress);
      const etherscan_url = getEtherscanBaseUrl(network.provider.type).replace('https://', '');
      this.goToBrowserUrl(url, etherscan_url);
    }
  };

  submitFeedback = () => {
    this.setState({ submitFeedback: true });
  };

  closeSubmitFeedback = () => {
    this.setState({ submitFeedback: false });
  };
  handleURL = url => {
    const handleError = error => {
      console.warn(error);
      this.closeSubmitFeedback();
    };
    if (USE_EXTERNAL_LINKS) {
      Linking.openURL(url)
        .then(this.closeSubmitFeedback)
        .catch(handleError);
    } else {
      this.goToBrowserUrl(url, strings('drawer.submit_bug'));
      this.closeSubmitFeedback();
    }
  };
  goToBugFeedback = () => {
    this.handleURL('https://metamask.zendesk.com/hc/en-us/requests/new');
  };

  goToGeneralFeedback = () => {
    const formId = '1FAIpQLSecHcnnn84-m01guIbv7Nh93mCj_G8IVdDn96dKFcXgNx0fKg';
    this.goToFeedback(formId);
  };

  goToFeedback = async formId => {
    const appVersion = await getVersion();
    const buildNumber = await getBuildNumber();
    const systemName = await getSystemName();
    const systemVersion = systemName === 'Android' ? await getApiLevel() : await getSystemVersion();
    this.handleURL(
      `https://docs.google.com/forms/d/e/${formId}/viewform?entry.649573346=${systemName}+${systemVersion}+MM+${appVersion}+(${buildNumber})`
    );
  };

  showHelp = () => {
    this.goToBrowserUrl('https://support.metamask.io', strings('drawer.metamask_support'));
  };

  goToBrowserUrl(url, title) {
    this.props.navigation.navigate('Webview', {
      url,
      title
    });
    this.hideDrawer();
  }

  hideDrawer() {
    return new Promise(resolve => {
      this.props.navigation.dispatch(DrawerActions.closeDrawer());
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }

  onAccountChange = () => {
    setTimeout(() => {
      this.toggleAccountsModal();
      this.hideDrawer();
    }, 300);
  };

  onImportAccount = () => {
    this.toggleAccountsModal();
    this.props.navigation.navigate('ImportPrivateKey');
    this.hideDrawer();
  };

  hasBlockExplorer = providerType => {
    const { frequentRpcList } = this.props;
    if (providerType === 'rpc') {
      const {
        network: {
          provider: { rpcTarget }
        }
      } = this.props;
      const blockExplorer = findBlockExplorerForRpc(rpcTarget, frequentRpcList);
      if (blockExplorer) {
        return true;
      }
    }
    return hasBlockExplorer(providerType);
  };

  getIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.grey400} />;
  }

  getFeatherIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.grey400} />;
  }

  getMaterialIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.grey400} />;
  }

  getImageIcon(name) {
    return <Image source={ICON_IMAGES[name]} style={styles.menuItemIconImage} />;
  }

  getSelectedIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.blue} />;
  }

  getSelectedFeatherIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.blue} />;
  }

  getSelectedMaterialIcon(name, size) {
    return <Icon name={name} size={size || 24} color={colors.blue} />;
  }

  getSelectedImageIcon(name) {
    return <Image source={ICON_IMAGES[`selected-${name}`]} style={styles.menuItemIconImage} />;
  }


  copyAccountToClipboard = async () => {
    const { selectedAddress } = this.props;
    await Clipboard.setString(selectedAddress);
    this.toggleReceiveModal();
    InteractionManager.runAfterInteractions(() => {
      Toast.show(strings('account_details.account_copied_to_clipboard'))
    });
  };

  onShare = () => {
    const { selectedAddress } = this.props;
    Share.open({
      message: generateUniversalLinkAddress(selectedAddress)
    }).catch(err => {
      console.log('Error while trying to share address', err);
    });
  };

  onSecureWalletModalAction = () => {
    this.setState({ showSecureWalletModal: false });
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('SetPasswordFlow');
    });
  };

  findRouteNameFromNavigatorState({ routes }) {
    let route = routes[routes.length - 1];
    while (route.index !== undefined) route = route.routes[route.index];
    return route.routeName;
  }

	/**
	 * Return step 5 of onboarding wizard if that is the current step
	 */
  renderOnboardingWizard = () => {
    const {
      wizard: { step }
    } = this.props;
    return (
      step === 5 && <OnboardingWizard navigation={this.props.navigation} coachmarkRef={this.browserSectionRef} />
    );
  };

  render() {
    const { network, accounts, identities, selectedAddress, keyrings, currentCurrency, ticker } = this.props;
    const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };
    account.balance = (accounts[selectedAddress] && renderFromWei(accounts[selectedAddress].balance)) || 0;
    const fiatBalance = Engine.getTotalFiatAccountBalance();
    if (fiatBalance !== this.previousBalance) {
      this.previousBalance = this.currentBalance;
    }
    this.currentBalance = fiatBalance;
    const fiatBalanceStr = renderFiat(this.currentBalance, currentCurrency);
    const currentRoute = this.findRouteNameFromNavigatorState(this.props.navigation.state);
    return (
      <View style={styles.wrapper} testID={'drawer-screen'}>
        <Modal
          isVisible={this.props.networkModalVisible}
          onBackdropPress={this.toggleNetworksModal}
          onBackButtonPress={this.toggleNetworksModal}
          onSwipeComplete={this.toggleNetworksModal}
          swipeDirection={'down'}
          propagateSwipe
        >
          <NetworkList onClose={this.onNetworksModalClose} />
        </Modal>
        <Modal
          isVisible={this.props.accountsModalVisible}
          style={styles.bottomModal}
          onBackdropPress={this.toggleAccountsModal}
          onBackButtonPress={this.toggleAccountsModal}
          onSwipeComplete={this.toggleAccountsModal}
          swipeDirection={'down'}
          propagateSwipe
        >
          <AccountList
            enableAccountsAddition
            identities={identities}
            selectedAddress={selectedAddress}
            keyrings={keyrings}
            onAccountChange={this.onAccountChange}
            onImportAccount={this.onImportAccount}
            ticker={ticker}
          />
        </Modal>
        {this.renderOnboardingWizard()}
        <Modal
          modalVisible={this.state.submitFeedback}
          confirmText={strings('drawer.submit_bug')}
          cancelText={strings('drawer.submit_general_feedback')}
          onCancelPress={this.goToGeneralFeedback}
          onRequestClose={this.closeSubmitFeedback}
          onConfirmPress={this.goToBugFeedback}
          cancelButtonMode={'warning'}
          confirmButtonMode={'primary'}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{strings('drawer.submit_feedback')}</Text>
            <Text style={styles.modalText}>{strings('drawer.submit_feedback_message')}</Text>
          </View>
        </ActionModal>
        <Modal
          visible={this.props.receiveModalVisible}
          onBackdropPress={this.toggleReceiveModal}
          onBackButtonPress={this.toggleReceiveModal}
          onSwipeComplete={this.toggleReceiveModal}
          swipeDirection={'down'}
          propagateSwipe
          style={styles.bottomModal}
        >
          <ReceiveRequest navigation={this.props.navigation} showReceiveModal={this.showReceiveModal} />
        </Modal>
      </View>
    );
  }
}

export default inject(({ store: state }) => ({

  network: state.engine.backgroundState.NetworkController,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  identities: state.engine.backgroundState.PreferencesController.identities,
  frequentRpcList: state.engine.backgroundState.PreferencesController.frequentRpcList,
  currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
  keyrings: state.engine.backgroundState.KeyringController.keyrings,
  networkModalVisible: state.modals.networkModalVisible,
  accountsModalVisible: state.modals.accountsModalVisible,
  receiveModalVisible: state.modals.receiveModalVisible,
  passwordSet: state.user.passwordSet,
  wizard: state.wizard,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  providerType: state.engine.backgroundState.NetworkController.provider.type,
  paymentChannelsEnabled: state.settings.paymentChannelsEnabled

  toggleNetworkModal: () => dispatch(toggleNetworkModal()),
  toggleAccountsModal: () => dispatch(toggleAccountsModal()),
  toggleReceiveModal: () => dispatch(toggleReceiveModal()),
  newAssetTransaction: selectedAsset => dispatch(newAssetTransaction(selectedAsset))

}))(observer(DrawerView))

