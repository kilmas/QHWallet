import React from 'react'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '@ant-design/react-native'
import TransactionHeader from '../TransactionHeader'
import AccountInfoCard from '../AccountInfoCard'
import { colors, fontStyles } from '../../../styles/common'
import Device from '../../../utils/devices'
import { strings } from '../../../locales/i18n'

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    paddingTop: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    paddingBottom: Device.isIphoneX() ? 20 : 0,
  },
  accountCardWrapper: {
    paddingHorizontal: 24,
  },
  intro: {
    ...fontStyles.bold,
    textAlign: 'center',
    color: colors.fontPrimary,
    fontSize: Device.isSmallDevice() ? 16 : 20,
    marginBottom: 8,
    marginTop: 16,
  },
  warning: {
    ...fontStyles.thin,
    color: colors.fontPrimary,
    paddingHorizontal: 24,
    marginBottom: 16,
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
  },
  actionContainer: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    minWidth: 150,
  },
  cancel: {
    marginRight: 8,
  },
  confirm: {
    marginLeft: 8,
  },
})

/**
 * Account access approval component
 */
class AccountApproval extends React.Component {
  static propTypes = {
    /**
     * Object containing current page title, url, and icon href
     */
    currentPageInformation: PropTypes.object,
    /**
     * Callback triggered on account access approval
     */
    onConfirm: PropTypes.func,
    /**
     * Callback triggered on account access rejection
     */
    onCancel: PropTypes.func,
    /**
     * Number of tokens
     */
    tokensLength: PropTypes.number,
    /**
     * Number of accounts
     */
    accountsLength: PropTypes.number,
    /**
     * A string representing the network name
     */
    networkType: PropTypes.string,
  }

  state = {
    start: Date.now(),
  }

  componentDidMount = () => {
    const params = this.getTrackingParams()
    delete params.timeOpen
    // InteractionManager.runAfterInteractions(() => {
    //   Analytics.trackEventWithParameters(ANALYTICS_EVENT_OPTS.AUTHENTICATION_CONNECT, params);
    // });
  }

  /**
   * Calls onConfirm callback and analytics to track connect confirmed event
   */
  onConfirm = () => {
    // Analytics.trackEventWithParameters(
    //   ANALYTICS_EVENT_OPTS.AUTHENTICATION_CONNECT_CONFIRMED,
    //   this.getTrackingParams()
    // );
    this.props.onConfirm()
  }

  /**
   * Calls onConfirm callback and analytics to track connect canceled event
   */
  onCancel = () => {
    // Analytics.trackEventWithParameters(
    //   ANALYTICS_EVENT_OPTS.AUTHENTICATION_CONNECT_CANCELED,
    //   this.getTrackingParams()
    // );
    this.props.onCancel()
  }

  /**
   * Returns corresponding tracking params to send
   *
   * @return {object} - Object containing numberOfTokens, numberOfAccounts, network and timeOpen
   */
  getTrackingParams = () => {
    const {
      tokensLength,
      accountsLength,
      networkType,
      currentPageInformation: { url },
    } = this.props
    return {
      view: url,
      numberOfTokens: tokensLength,
      numberOfAccounts: accountsLength,
      network: networkType,
      timeOpen: (Date.now() - this.state.start) / 1000,
    }
  }

  render = () => {
    const { currentPageInformation } = this.props
    return (
      <View style={styles.root}>
        <TransactionHeader currentPageInformation={currentPageInformation} />
        <Text style={styles.intro}>{strings('accountApproval.action')}</Text>
        <Text style={styles.warning}>{strings('accountApproval.warning')}</Text>
        <View style={styles.accountCardWrapper}>
          <AccountInfoCard />
        </View>
        <View style={styles.actionContainer}>
          <Button type="ghost" onPress={this.onCancel} style={styles.button} testID={'connect-cancel-button'}>
            {strings('accountApproval.cancel')}
          </Button>
          <Button type="primary" onPress={this.onConfirm} style={styles.button} testID={'connect-approve-button'}>
            {strings('accountApproval.connect')}
          </Button>
        </View>
      </View>
    )
  }
}

export default inject(({ store: state }) => ({
  accountsLength: Object.keys(state.engine.backgroundState.AccountTrackerController.accounts).length,
  tokensLength: state.engine.backgroundState.AssetsController.tokens.length,
  networkType: state.engine.backgroundState.NetworkController.provider.type,
}))(observer(AccountApproval))
