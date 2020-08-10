import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { InteractionManager, SafeAreaView, Dimensions, StyleSheet, View, Text } from 'react-native'
import { inject, observer } from 'mobx-react'
import Share from 'react-native-share'
import ElevatedView from 'react-native-elevated-view'
import { Icon, Modal } from '@ant-design/react-native'
import { colors, fontStyles } from '../../../styles/common'
import Device from '../../../utils/devices'
import { generateUniversalLinkAddress } from '../../../utils/payment-link-generator'
import AddressQRCode from '../AddressQRCode'
import { strings } from '../../../locales/i18n'
import ReceiveRequestAction from './ReceiveRequestAction'

const TOTAL_PADDING = 64
const ACTION_WIDTH = (Dimensions.get('window').width - TOTAL_PADDING) / 2

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggerWrapper: {
    height: 45,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey100,
    paddingLeft: 10,
  },
  dragger: {
    width: 48,
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.grey400,
    opacity: Device.isAndroid() ? 0.6 : 0.5,
  },
  actionsWrapper: {
    marginHorizontal: 16,
    paddingBottom: Device.isIphoneX() ? 16 : 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...fontStyles.normal,
    fontSize: 18,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  titleWrapper: {
    marginVertical: 8,
  },
  modal: {
    margin: 0,
    width: '100%',
  },
  copyAlert: {
    width: 180,
    backgroundColor: colors.darkAlert,
    padding: 20,
    paddingTop: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  copyAlertIcon: {
    marginBottom: 20,
  },
  copyAlertText: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 16,
    ...fontStyles.normal,
  },
  receiveAction: {
    flex: 1,
    width: ACTION_WIDTH,
    height: ACTION_WIDTH,
  },
  closeIcon: {
    backgroundColor: '#ddf',
  },
})

/**
 * PureComponent that renders receive options
 */
class ReceiveRequest extends PureComponent {
  static propTypes = {
    /**
     * The navigator object
     */
    navigation: PropTypes.object,
    /**
     * Selected address as string
     */
    selectedAddress: PropTypes.string,
    /**
     * Asset to receive, could be not defined
     */
    receiveAsset: PropTypes.object,
    /**
     * Action that toggles the receive modal
     */
    toggleReceiveModal: PropTypes.func,
  }

  state = {
    qrModalVisible: false,
    buyModalVisible: false,
  }

  /**
   * Share current account public address
   */
  onShare = () => {
    const { selectedAddress } = this.props
    Share.open({
      message: generateUniversalLinkAddress(selectedAddress),
    }).catch(err => {
      console.log('Error while trying to share address', err)
    })
  }

  /**
   * Shows an alert message with a coming soon message
   */
  onBuy = () => {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ buyModalVisible: true })
      setTimeout(() => {
        this.setState({ buyModalVisible: false })
      }, 1500)
    })
  }

  /**
   * Closes QR code modal
   */
  closeQrModal = () => {
    this.setState({ qrModalVisible: false })
  }

  /**
   * Opens QR code modal
   */
  openQrModal = () => {
    this.setState({ qrModalVisible: true })
  }

  onReceive = () => {
    this.props.toggleReceiveModal()
    this.props.navigation.navigate('PaymentRequestView', { receiveAsset: this.props.receiveAsset })
  }

  actions = [
    {
      icon: <Icon name="share-alt" size={28} color={colors.black} />,
      title: strings('receive_request.share_title'),
      description: strings('receive_request.share_description'),
      onPress: this.onShare,
    },
    {
      icon: <Icon name="qrcode" size={32} color={colors.black} />,
      title: strings('receive_request.qr_code_title'),
      description: strings('receive_request.qr_code_description'),
      onPress: this.openQrModal,
    },
    {
      icon: <Icon solid name="pull-request" size={30} color={colors.black} />,
      title: strings('receive_request.request_title'),
      description: strings('receive_request.request_description'),
      onPress: this.onReceive,
    },
    {
      icon: <Icon name={'credit-card'} size={32} color={colors.black} />,
      title: strings('receive_request.buy_title'),
      description: strings('receive_request.buy_description'),
      onPress: this.onBuy,
    },
  ]

  render() {
    const { qrModalVisible, buyModalVisible } = this.state

    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.actionsWrapper}>
          <View style={styles.row}>
            <ReceiveRequestAction
              style={styles.receiveAction}
              icon={this.actions[0].icon}
              actionTitle={this.actions[0].title}
              actionDescription={this.actions[0].description}
              onPress={this.actions[0].onPress}
            />
            <ReceiveRequestAction
              style={styles.receiveAction}
              icon={this.actions[1].icon}
              actionTitle={this.actions[1].title}
              actionDescription={this.actions[1].description}
              onPress={this.actions[1].onPress}
            />
          </View>
          <View style={styles.row}>
            <ReceiveRequestAction
              style={styles.receiveAction}
              icon={this.actions[2].icon}
              actionTitle={this.actions[2].title}
              actionDescription={this.actions[2].description}
              onPress={this.actions[2].onPress}
            />
            <ReceiveRequestAction
              style={styles.receiveAction}
              icon={this.actions[3].icon}
              actionTitle={this.actions[3].title}
              actionDescription={this.actions[3].description}
              onPress={this.actions[3].onPress}
            />
          </View>
        </View>
        <Modal
          transparent
          closable
          maskClosable
          title="ETH Address"
          visible={qrModalVisible}
          onClose={this.closeQrModal}
          onBackdropPress={this.closeQrModal}
          onBackButtonPress={this.closeQrModal}
          onSwipeComplete={this.closeQrModal}
          propagateSwipe>
          <AddressQRCode closeQrModal={this.closeQrModal} />
        </Modal>
        <Modal
          transparent
          closable
          visible={buyModalVisible}
          onClose={this.onClose}
          onBackdropPress={this.onClose}
          onBackButtonPress={this.onClose}
          backdropOpacity={0}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}
          useNativeDriver>
          <ElevatedView style={styles.copyAlert} elevation={5}>
            <View style={styles.copyAlertIcon}>
              <Icon name="clock-circle" size={64} color={colors.white} />
            </View>
            <Text style={styles.copyAlertText}>{strings('receive_request.coming_soon')}</Text>
          </ElevatedView>
        </Modal>
      </SafeAreaView>
    )
  }
}

export default inject(({ store: state }) => ({
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
  receiveAsset: state.modals.receiveAsset,

  toggleReceiveModal: state.modals.toggleReceiveModal,
}))(observer(ReceiveRequest))
