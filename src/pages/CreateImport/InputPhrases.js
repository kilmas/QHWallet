import React from 'react'
import { validateMnemonic } from 'bip39'
import _ from 'lodash'
import { Text, TextInput } from 'react-native'
import { inject, observer } from 'mobx-react'
import { Flex, Toast, Button } from '@ant-design/react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import { styles as themeStyles, BGGray } from '../../theme'
import GlobalNavigation from '../../utils/GlobalNavigation'
import HDAccount from '../../stores/account/HDAccount'
import setKeyChain from '../../utils/keychain'
import SecureKeychain from '../../modules/metamask/core/SecureKeychain'

@inject('store')
@observer
class InputPhrases extends React.Component {
  constructor(props) {
    super(props)
    this.handleClickThrottled = _.throttle(this.onPress, 8000)
  }

  state = {
    list: new Array(12).fill(''),
  }

  onPress = async () => {
    this.setState({ loading: true })
    // InteractionManager.runAfterInteractions(async ()=>{
    try {
      let password = this.props.navigation.getParam('password')
      const name = this.props.navigation.getParam('name')
      const mnemonics = this.state.list.join(' ')
      if (!validateMnemonic(mnemonics)) {
        Toast.fail(strings('wallet.importFailTip'))
        return
      }
      let reset = true
      if (!password) {
        const keyObj = await SecureKeychain.getGenericPassword()
        password = keyObj.password
        reset = false
      }
      const account = await HDAccount.import(mnemonics, name, password)
      if (reset) {
        const keychain = await setKeyChain(name, password)
        if (!keychain) {
          return
        }
      }
      this.props.store.engine.importMetamask(mnemonics, password, reset)
      this.props.store.accountStore.insert(account)
      this.setState({ loading: false })
      GlobalNavigation.reset('TabDrawer', {
        mnemonics: this.state.list,
        name: this.props.navigation.state.params.name,
        password: this.state.password,
      })
    } catch (error) {
      console.warn(error)
      Toast.fail(strings('Input failed, error'))
    }
    // })
  }

  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.import')} />
        <KeyboardAwareScrollView style={themeStyles.pt26}>
          <Text
            style={{
              fontSize: 18,
              marginBottom: 30,
            }}>
            {strings('wallet.notesInput')}
          </Text>
          <Flex style={{ marginBottom: 80 }} justify={'between'} wrap={'wrap'}>
            {this.state.list.map((item, index) => (
              <Flex
                key={index}
                style={{
                  width: '33.2%',
                  height: 45,
                  backgroundColor: BGGray,
                  ...themeStyles.border,
                  borderColor: '#e0e0e0',
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: '#333',
                    width: 18,
                    marginLeft: 13,
                  }}>
                  {index + 1}
                </Text>

                <TextInput
                  style={{
                    fontSize: 13,
                    color: '#000000',
                    fontWeight: '500',
                    width: 100,
                  }}
                  autoCapitalize={'none'}
                  value={this.state.list[index]}
                  multiline={false}
                  numberOfLines={1}
                  onChangeText={e => {
                    if (e.substr(-1, 1) === ' ') {
                      return
                    }
                    this.state.list[index] = e.toLowerCase()
                    this.setState({})
                  }}
                />
              </Flex>
            ))}
          </Flex>

          <Button disabled={this.state.loading} loading={this.state.loading} type="primary" onPress={this.handleClickThrottled}>
            {strings('import')}
          </Button>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

export default InputPhrases
