import React from 'react';
import { Text, View, TextInput } from 'react-native';
import { Checkbox, List, Button, Flex, Toast } from '@ant-design/react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { okChainRequest } from '../../utils/request';
import TitleBar from '../../components/TitleBar';
import OKClient from '../../modules/okchain';
const AgreeItem = Checkbox.AgreeItem;
const CheckboxItem = Checkbox.CheckboxItem;
export default class VoteList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      checkBox1: true,
      agreeItem1: true,
      checkboxItem1: true,
      validators: [],
      voteValidators: [],
      amount: '0',
    };
  }

  _reflesh() {
    okChainRequest.getValidators().then(res => {
      const { data } = res
      this.setState({
        validators: data
      })
    })
    const address = this.props.navigation.getParam('address')
    okChainRequest.getDelegators(address).then(res => {
      const { data } = res
      this.setState({
        voteValidators: data.validator_address,
        amount: data.tokens
      })
    })
  }

  componentDidMount() {
    this._reflesh()
  }

  sendTx = async (callback) => {
    this.setState({ loading: true })
    await callback()
    this.setState({ loading: false })
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
          <Button type="primary" style={{ marginHorizontal: 5 }} disabled={this.state.loading} loading={this.state.loading} onPress={() => {
            this.sendTx(async ()=> {
              return await OKClient.delegate(Number(this.state.amount || 0).toFixed(8))
            })
          }}>Delegate</Button>
          <Button type="primary" disabled={this.state.loading} loading={this.state.loading} onPress={() => {
            this.sendTx(async ()=> {
              return await OKClient.vote(this.state.voteValidators)
            })
          }}>Vote</Button>
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
                unAmount:amount,
              })
            }}
            keyboardType="numeric"
          />
          <Text>OKT</Text>
          <Button type="primary" style={{ marginHorizontal: 5 }} disabled={this.state.loading} loading={this.state.loading} onPress={() => {
            this.sendTx(async ()=> {
              Toast.info('Comming soon')
              // const test = await OKClient.unBond(Number(this.state.unAmount || 0).toFixed(8))
            })
          }}>unDelegate</Button>
        </Flex>
        <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          <List style={{ marginTop: 12 }} renderHeader="Select Bp to Vote">
            {
              this.state.validators.map(item => <CheckboxItem defaultChecked={validators.has(item.operator_address)} thumb={item.description.identity} key={item.operator_address} onChange={event => {
                this.setState(state => {
                  const voteValidators = new Set(state.voteValidators)
                  if (event.target.checked) {
                    voteValidators.add(item.operator_address)
                  } else {
                    voteValidators.delete(item.operator_address)
                  }
                  return { voteValidators: Array.from(voteValidators) }
                });
              }}>
                {item.description.moniker}
                <List.Item.Brief>{item.description.details}</List.Item.Brief>
              </CheckboxItem>)
            }
          </List>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}