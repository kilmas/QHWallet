import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Dimensions, StyleSheet, View, Text } from 'react-native';
import { inject, observer } from 'mobx-react'
import { Toast } from '@ant-design/react-native';
import Clipboard from '@react-native-community/clipboard';
import QRCode from 'react-native-qrcode-svg';
import { strings } from '../../../locales/i18n';
import { colors, fontStyles } from '../../../styles/common';

const WIDTH = Dimensions.get('window').width - 88;

const styles = StyleSheet.create({
  root: {
    minHeight: 350,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  wrapper: {
    flex: 1,
    alignItems: 'center'
  },
  qrCode: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    backgroundColor: colors.grey000,
    borderRadius: 8
  },
  addressWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WIDTH,
    borderRadius: 8,
    backgroundColor: colors.grey000,
    paddingVertical: 12
  },
  addressTitle: {
    fontSize: 16,
    paddingHorizontal: 28,
    paddingVertical: 4,
    ...fontStyles.normal
  },
  address: {
    ...fontStyles.normal,
    paddingHorizontal: 28,
    paddingVertical: 4,
    fontSize: 16,
    textAlign: 'center'
  }
});

/**
 * PureComponent that renders a public address view
 */
class AddressQRCode extends React.Component {
  static propTypes = {
		/**
		 * Selected address as string
		 */
    selectedAddress: PropTypes.string,
		/**
		/* Triggers global alert
		*/
    showAlert: PropTypes.func,
		/**
		/* Callback to close the modal
		*/
    closeQrModal: PropTypes.func
  };

	/**
	 * Closes QR code modal
	 */
  closeQrModal = () => {
    const { closeQrModal } = this.props;
    closeQrModal && closeQrModal();
  };

  copyAccountToClipboard = async () => {
    const { selectedAddress } = this.props;
    await Clipboard.setString(selectedAddress);
    Toast.show(strings('account_details.account_copied_to_clipboard'));
  };

  processAddress = () => {
    const { selectedAddress } = this.props;
    const processedAddress = `${selectedAddress.slice(0, 2)} ${selectedAddress
      .slice(2)
      .match(/.{1,4}/g)
      .join(' ')}`;
    return processedAddress;
  };

  render() {
    return (
      <View style={styles.root}>
        <QRCode
          value={`${this.props.selectedAddress}`}
          size={200}
        />
        <View style={styles.addressWrapper}>
          <TouchableOpacity onPress={this.copyAccountToClipboard}>
            <Text style={styles.address}>
              {this.processAddress()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default inject(({ store: state }) => ({
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress

}))(observer(AddressQRCode))
