import React from 'react'
import { Text, View, TextInput, TouchableOpacity } from 'react-native'
import { Checkbox, List, Button, Flex } from '@ant-design/react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { okChainRequest } from '../../utils/request'
import TitleBar from '../../components/TitleBar'
import OKClient from '../../modules/okchain'
import { goBrowser } from '../../utils/common'
const CheckboxItem = Checkbox.CheckboxItem
export default class VoteList extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      validators: [],
      voteValidators: [],
      amount: '0',
    }
  }

  _reflesh() {
    okChainRequest
      .getValidators()
      .then(res => {
        const { data } = res
        this.setState({
          validators: data,
        })
      })
      .catch(e => {
        console.warn(e)
      })
    const address = this.props.navigation.getParam('address')
    okChainRequest
      .getDelegators(address)
      .then(res => {
        const { data } = res
        this.setState({
          voteValidators: data.validator_address,
          amount: data.tokens,
        })
      })
      .catch(e => {
        console.warn(e)
      })
  }

  gotoTxHash = () => {
    if (this.state.transactionId) {
      const browserUrl = `https://www.oklink.com/okchain-test/tx/${this.state.transactionId}`
      goBrowser(this.props.navigation, browserUrl)
    }
  }

  componentDidMount() {
    this._reflesh()
  }

  sendTx = async callback => {
    this.setState({ loading: true })
    const transactionId = await callback()
    this.setState({ loading: false, transactionId })
    this._reflesh()
  }

  render() {
    const validators = new Set(this.state.voteValidators)
    return (
      <View>
        <TitleBar title="VoteList" />
        <Flex align="center" style={{ margin: 10 }}>
          <TextInput
            style={{ height: 45, flex: 1 }}
            numberOfLines={1}
            keyboardType={'decimal-pad'}
            placeholder="Vote Amount"
            defaultValue={this.state.amount}
            onChangeText={amount => {
              this.setState({
                amount,
              })
            }}
            keyboardType="numeric"
          />
          <Text>OKT</Text>
          <Button
            type="primary"
            style={{ marginHorizontal: 5 }}
            disabled={this.state.loading}
            loading={this.state.loading}
            onPress={() => {
              this.sendTx(async () => {
                const { result: { txhash } = {} } = await OKClient.delegate(Number(this.state.amount || 0).toFixed(8))
                return txhash
              })
            }}>
            Delegate
          </Button>
          <Button
            type="primary"
            disabled={this.state.loading}
            loading={this.state.loading}
            onPress={() => {
              this.sendTx(async () => {
                const { result: { txhash } = {} } = await OKClient.vote(this.state.voteValidators)
                return txhash
              })
            }}>
            Vote
          </Button>
        </Flex>
        <Flex align="center" style={{ margin: 10 }}>
          <TextInput
            style={{ height: 45, flex: 1 }}
            numberOfLines={1}
            keyboardType={'decimal-pad'}
            placeholder="unDelegate Amount"
            value={this.state.unAmount}
            onChangeText={amount => {
              this.setState({
                unAmount: amount,
              })
            }}
            keyboardType="numeric"
          />
          <Text>OKT</Text>
          <Button
            type="primary"
            style={{ marginHorizontal: 5 }}
            disabled={this.state.loading}
            loading={this.state.loading}
            onPress={() => {
              this.sendTx(async () => {
                if (!this.state.unAmount) return
                const { result: { txhash } = {} } = await OKClient.unBond(Number(this.state.unAmount || 0).toFixed(8))
                return txhash
              })
            }}>
            unDelegate
          </Button>
        </Flex>
        <Flex style={{margin: 10}}>
          {this.state.transactionId && <TouchableOpacity onPress={this.gotoTxHash}><Text style={{color: 'blue', textDecorationLine: 'underline'}}>txhash:{this.state.transactionId}</Text></TouchableOpacity>}
        </Flex>
        <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 300 }}>
          <List style={{ marginTop: 12 }} renderHeader="Select Bp to Vote">
            {this.state.validators.map(item => (
              <CheckboxItem
                defaultChecked={validators.has(item.operator_address)}
                thumb={item.description.identity}
                key={item.operator_address}
                onChange={event => {
                  this.setState(state => {
                    const voteValidators = new Set(state.voteValidators)
                    if (event.target.checked) {
                      voteValidators.add(item.operator_address)
                    } else {
                      voteValidators.delete(item.operator_address)
                    }
                    return { voteValidators: Array.from(voteValidators) }
                  })
                }}>
                {item.description.moniker}
                <List.Item.Brief>{item.description.details}</List.Item.Brief>
              </CheckboxItem>
            ))}
          </List>
        </KeyboardAwareScrollView>
      </View>
    )
  }
}
