import React from 'react'
import { Text, TextInput } from 'react-native'
import _ from 'lodash'
import { Flex, Toast, Button } from '@ant-design/react-native'
import { computed } from 'mobx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { inject, observer } from 'mobx-react'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import { styles as themeStyles } from '../../theme'
import GlobalNavigation from '../../utils/GlobalNavigation'

@inject('store')
@observer
class DeleteWallet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: new Array(12).fill(''),
    }
  }

  @computed get mnemonics() {
    const { navigation } = this.props
    return navigation.getParam('mnemonics')
  }

  @computed get account() {
    const { navigation } = this.props
    return navigation.getParam('account')
  }

  @computed get privateKey() {
    const { navigation } = this.props
    return navigation.getParam('privateKey')
  }

  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.deleteWallet')} />
        <KeyboardAwareScrollView style={themeStyles.pt26}>
          {this.mnemonics && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  marginVertical: 15,
                }}>
                {strings('wallet.notesInput')}
              </Text>
              <Flex style={{ marginBottom: 20 }} justify={'between'} wrap={'wrap'}>
                {this.state.list.map((item, index) => (
                  <Flex
                    key={index}
                    style={{
                      height: 50,
                      width: '33.2%',
                      backgroundColor: '#F7F8F9',
                      borderColor: '#e0e0e0',
                      borderWidth: 0.5,
                    }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#333',
                        marginLeft: 10,
                      }}>
                      {index + 1}
                    </Text>
                    <TextInput
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
            </>
          )}
          {this.privateKey && (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: '#4A4A4A',
                  marginBottom: 15,
                }}>
                input privateKey and verify
              </Text>
              <TextInput
                style={{
                  fontSize: 13,
                  borderRadius: 8,
                  backgroundColor: '#e0e0e0',
                  minHeight: 100
                }}
                multiline
                value={this.state.prikey}
                numberOfLines={4}
                onChangeText={text => {
                  this.setState({ prikey: _.trim(text) })
                }}
              />
            </>
          )}
          <Text
            style={{
              fontSize: 14,
              marginVertical: 50,
            }}>
            {strings('wallet.deleteNote')}
          </Text>
          <Button
            loading={this.state.loading}
            disabled={this.state.loading}
            type="warning"
            onPress={async () => {
              this.setState({ loading: true })
              try {
                if (this.mnemonics) {
                  const mnemonics = this.state.list.join(' ').toLowerCase()
                  if (this.mnemonics === mnemonics) {
                    const { accountStore } = this.props.store
                    const success = await accountStore.drop(this.account)
                    if (success) {
                      Toast.success('Delete successfully', 1, () => {
                        GlobalNavigation.reset('TabDrawer')
                      })
                    } else {
                      Toast.fail('Delete fail')
                    }
                  } else {
                    Toast.fail('Mnemonics incorrect')
                  }
                } else if (this.privateKey) {
                  if (this.privateKey === this.state.prikey) {
                    const { accountStore } = this.props.store
                    const success = await accountStore.drop(this.account)
                    if (success) {
                      Toast.success('Delete successfully', 1, () => {
                        GlobalNavigation.reset('TabDrawer')
                      })
                    } else {
                      Toast.fail('Delete fail')
                    }
                  } else {
                    Toast.fail('privateKey incorrect')
                  }
                }
              } catch (e) {
                Toast.info('Delete failed')
              } finally {
                this.setState({ loading: false })
              }
            }}>
            Delete Wallet
          </Button>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

export default DeleteWallet
