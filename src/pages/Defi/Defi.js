import React from 'react'
import { TouchableOpacity, View, StyleSheet, Text, BackHandler } from 'react-native'
import URL from 'url-parse'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Icon, Toast, Modal, Flex, Tabs } from '@ant-design/react-native'
import { computed } from 'mobx'
import WebView from 'react-native-webview'
import TitleBar from '../../components/TitleBar'
import Container from '../../components/Container'
import DrawerIcon from '../../components/DrawerIcon'
import WebviewError from '../../components/UI/WebviewError'
import AppConstants from '../../modules/metamask/core/AppConstants'
import RenderIronman from '../../modules/ironman/RenderIronman'
import Ironman from '../../modules/ironman'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'
import Device from '../../utils/devices';

import { SPA_urlChangeListener, JS_WINDOW_INFORMATION, JS_DESELECT_TEXT } from '../../utils/browserScripts';
import { isBiometry } from '../../utils/keychain'
import WebviewProgressBar from '../../components/UI/WebviewProgressBar'

const { USER_AGENT } = AppConstants

@inject('store')
@observer
class Defi extends React.Component {
  static defaultProps = {
    defaultProtocol: 'https://',
  }

  static propTypes = {
    /**
     * The ID of the current tab
     */
    id: PropTypes.number,
    /**
     * Protocol string to append to URLs that have none
     */
    defaultProtocol: PropTypes.string,
    /**
     * react-navigation object used to switch between screens
     */
    navigation: PropTypes.object,
    /**
     * A string representing the network id
     */
    network: PropTypes.string,
    /**
     * Url coming from an external source
     * For ex. deeplinks
     */
    url: PropTypes.string,
    /**
     * Function to store the a page in the browser history
     */
    /**
     * the current version of the app
     */
    app_version: PropTypes.string,
  }

  @computed get selectedAddress() {
    if (!this.props.store) {
      return '0x'
    }
    return this.props.store.AccountStore.currentAccount.ETHWallet.address
  }

  constructor(props) {
    super(props)

    this.state = {
      currentPageTitle: '',
      currentPageUrl: '',
      currentPageIcon: undefined,
      entryScriptjs: null,
      homepageScripts: null,
      hostname: '',
      inputValue: '',
      timeout: false,
      url: null,
      forwardEnabled: false,
      forceReload: false,
      suggestedAssetMeta: undefined,
      lastError: null,
      lastUrlBeforeHome: null,
      webUri: 'https://www.okex.me/dex-test/spot/trade',
      webviewKey: 0,
    }
  }

  backgroundBridges = []
  webview = React.createRef()
  inputRef = React.createRef()
  isReloading = false

  async componentDidMount() {
    this.mounted = true
    this.init()
  }

  initialReload = () => {
    if (this.webview && this.webview.stopLoading) {
      this.webview.stopLoading()
    }
    this.forceReload(true)
    this.init()
  }

  initializeBackgroundBridge = () => { }

  notifyConnection = (payload, hostname, restricted = true) => {
    const { privacyMode, approvedHosts } = this.props
    // TODO:permissions move permissioning logic elsewhere
    this.backgroundBridges.forEach(bridge => {
      if (bridge.hostname === hostname && (!restricted || !privacyMode || approvedHosts[bridge.hostname])) {
        bridge.sendNotification(payload)
      }
    })
  }

  init = async () => {

    const analyticsEnabled = false
    const disctinctId = ''

    const homepageScripts = `
      window.__mmFavorites = ${JSON.stringify(this.props.bookmarks)};
      window.__mmSearchEngine = "${this.props.searchEngine}";
      window.__mmMetametrics = ${analyticsEnabled};
	    window.__mmDistinctId = "${disctinctId}";
	  `
    let publicKey
    let accounts = []
    const { FOAccounts, OKTAccounts, currentFOID } = this.props.store.accountStore

    if (!FOAccounts.length || !OKTAccounts.length) {
      Toast.info('please import account')
    } else {
      FOAccounts.forEach((item) => {
        if (item.FOWallet.hasCreated) {
          if (currentFOID === item.id) {
            publicKey = item.FOWallet.address
            accounts = [{
              name: item.FOWallet.name || item.name,
              blockchain: 'fibos',
              authority: `active`,
            }, ...accounts]
          } else {
            accounts.push({
              name: item.FOWallet.name || item.name,
              blockchain: 'fibos',
              authority: `active`,
            })
          }
        }
      })
    }
    const entryScriptjs = RenderIronman(accounts, publicKey)
    await this.setState({ entryScriptjs: entryScriptjs + SPA_urlChangeListener, homepageScripts })

    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
    // Handle hardwareBackPress event only for browser, not components rendered on top
    this.props.navigation.addListener('willFocus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackPress);
    });
    this.props.navigation.addListener('willBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
    });
  }

  goBack = () => {
    this.goingBack = true;
    setTimeout(() => {
      this.goingBack = false;
    }, 500);
    const { goBack } = this.webview;
    goBack && goBack();

    setTimeout(() => {
      this.props.navigation.setParams({
        ...this.props.navigation.state.params,
        url: this.state.inputValue
      });
    }, 100);
    // Need to wait for nav_change & onPageChanged
    setTimeout(() => {
      this.setState({
        forwardEnabled: true,
        currentPageTitle: null
      });
    }, 1000);
  };

  handleAndroidBackPress = () => {
    this.goBack();
    return true;
  };

  refreshHomeScripts = async () => {
    const analyticsEnabled = false
    const disctinctId = ''
    const homepageScripts = `
      window.__mmFavorites = ${JSON.stringify(this.props.bookmarks)};
      window.__mmSearchEngine="${this.props.searchEngine}";
      window.__mmMetametrics = ${analyticsEnabled};
      window.__mmDistinctId = "${disctinctId}";
      window.postMessage('updateFavorites', '*');
	`
    this.setState({ homepageScripts }, () => {
      const { injectJavaScript } = this.webview
      if (injectJavaScript) {
        injectJavaScript(homepageScripts)
      }
    })
  }

  componentDidUpdate() { }

  componentWillUnmount() {
    this.mounted = false
    this.backgroundBridges.forEach(bridge => bridge.onDisconnect())

    this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
    if (Device.isAndroid()) {
      BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackPress);
    }
  }

  transferFo = async (data) => {
    const {
      ironman,
      params = {},
    } = data
    if (ironman === 'signProvider') {
      const { transaction } = params
      if (transaction) {
        const { actions } = transaction
        const cancel = () => {
          this.webview.postMessage(JSON.stringify({ ...data, msg: 'cancel' }))
        }
        const confirm = async (pwd, password) => {
          if (pwd === password) {
            const fibos = Ironman.fibos
            const resp = await fibos.transaction(transaction, { broadcast: false })
            const {
              transaction: {
                signatures
              }
            } = resp
            Toast.success('sign success')
            this.webview.postMessage(JSON.stringify({ ...data, data: signatures }))
          } else {
            Toast.fail('password fail')
            currentWebview.postMessage(JSON.stringify({ ...data, msg: 'password fail' }))
          }
        }
        const actionsBtn = [{ text: 'Cancel', style: 'cancel', onPress: cancel }, {
          text: 'Confirm', onPress: async (pwd) => {
            try {
              const { password } = await SecureKeychain.getGenericPassword();
              confirm(pwd !== undefined ? pwd : password, password)
            } catch (error) {
              currentWebview.postMessage(JSON.stringify({ ...data, msg: 'sign fail' }))
            }
          }
        }]

        const biometry = await isBiometry()
        if (biometry) {
          Modal.alert('Sign transaction', `${JSON.stringify(actions)}`, actionsBtn, cancel);
        } else {
          Modal.prompt('Sign transaction', `${JSON.stringify(actions)}`, actionsBtn,
            'secure-text', '', ['', 'Input your password'], cancel);
        }
      }
    }
  }

  onMessage = message => {
    let {
      nativeEvent: { data },
    } = message

    try {
      data = typeof data === 'string' ? JSON.parse(data) : data
      if (data && data.ironman) {
        this.transferFo(data)
        return
      }

      switch (data.type) {
        case 'FRAME_READY': {
          break;
        }

        case 'NAV_CHANGE': {
          const { url, title } = data.payload;
          this.setState({
            inputValue: url,
            autocompletInputValue: url,
            currentPageTitle: title,
            forwardEnabled: false
          });
          this.setState({ lastUrlBeforeHome: null });
          this.props.navigation.setParams({ url: data.payload.url, silent: true, showUrlModal: false });
          break;
        }

        case 'GET_TITLE_FOR_BOOKMARK':
          if (data.payload.title) {
            this.setState({
              currentPageTitle: data.payload.title,
              currentPageUrl: data.payload.url,
            });
          }
          break;
      }
    } catch (e) {
      console.warn(e, `Browser::onMessage on ${this.state.inputValue}`)
    }
  }

  onLoadProgress = ({ nativeEvent: { progress } }) => {
    this.setState({ progress })
  }

  onLoadEnd = () => {
    if (this.webview) {
      const js = this.state.homepageScripts
      this.webview.injectJavaScript(js)
    }
  }

  onError = ({ nativeEvent: errorInfo }) => {
    console.log('error', errorInfo)
    this.setState({ lastError: errorInfo })
  }

  webviewRefIsReady = () => this.webview && this.webview.webViewRef && this.webview.webViewRef.current

  onLoadStart = async ({ nativeEvent }) => {
    if (this.webviewRefIsReady()) {
      setTimeout(() => {
        // Reset the previous bridges
        this.backgroundBridges.length && this.backgroundBridges.forEach(bridge => bridge.onDisconnect())
        this.backgroundBridges = []
        const origin = new URL(nativeEvent.url).origin
        this.initializeBackgroundBridge(origin, true)
      }, 2000)
    }
  }

  onPageChange = (data) => {
    // console.log("onPageChange", data)
  }

  reload = () => {
    this.webview && this.webview.reload()
  }

  forceReload = initialReload => {
    this.isReloading = true

    // As we're reloading to other url we should remove this callback
    const url2Reload = this.state.inputValue

    // If it is the first time the component is being mounted, there should be no cache problem and no need for remounting the component
    if (initialReload) {
      this.isReloading = false
      return
    }

    // Force unmount the webview to avoid caching problems
    this.setState({ forceReload: true }, () => {
      this.webview = null
    })
  }

  renderProgressBar = () => (
    <View style={styles.progressBarWrapper}>
      <WebviewProgressBar progress={this.state.progress} />
    </View>
  );


  render() {
    const { entryScriptjs, webUri } = this.state
    const urls = ['https://dex.fo/mobile', 'https://deotc.bitewd.com',]
    return (
      <Container>
        <TitleBar
          title={'Defi'}
          renderLeft={() => <DrawerIcon dot={this.props.store.common.newVersion} />}
          renderRight={() => (
            <TouchableOpacity
              onPress={() => {
                this.reload()
              }}>
              <Icon name="reload" />
            </TouchableOpacity>
          )}
        />
        {this.renderProgressBar()}
        <Tabs onTabClick={(index, key) => {
          this.setState({ webviewKey: key })
        }} tabs={[{ title: 'Dex.fo' }, { title: 'DE OTC' }]} swipeable={false} usePaged={false} initialPage={0} tabBarPosition="top">
          {
            urls.map((uri, index) => (
              <View key={uri} style={{ flex: 1 }}>
                {this.state.webviewKey === index && !!entryScriptjs &&
                <WebView
                  bounces={false}
                  directionalLockEnabled
                  source={{ uri }}
                  scrollEnabled={false}
                  overScrollMode={'never'}
                  ref={r => {
                    this.webview = r
                  }}
                  style={{ backgroundColor: '#fff' }}
                  containerStyle={{ backgroundColor: '#152' }}
                  renderError={() => <WebviewError error={this.state.lastError} onReload={this.forceReload} />}
                  injectedJavaScript={entryScriptjs}
                  // injectedJavaScriptBeforeContentLoaded={entryScriptjs}
                  onLoadProgress={this.onLoadProgress}
                  onLoadStart={this.onLoadStart}
                  onLoadEnd={this.onLoadEnd}
                  onError={this.onError}
                  onMessage={this.onMessage}
                  onNavigationStateChange={this.onPageChange}
                  userAgent={USER_AGENT}
                  sendCookies
                  javascriptEnabled
                  allowsInlineMediaPlayback
                  useWebkit
                />
              }
              </View>
            ))
          }
        </Tabs>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  loader: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    zIndex: 1,
    backgroundColor: '#ffd',
  },
  progressBarWrapper: {
    height: 3,
    width: '100%',
    // left: 0,
    // right: 0,
    // top: 0,
    // position: 'absolute',
    // zIndex: 999999
  },
})

export default Defi
