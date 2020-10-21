import React from 'react'
import { Image, ScrollView, Text } from 'react-native'
import { inject, observer } from 'mobx-react'
import { Flex, Button, Icon, Checkbox } from '@ant-design/react-native'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'

@inject('store')
@observer
class PrivacyPolicies extends React.Component {
  state = {
    hasRead: true,
  }

  render() {
    const mode = this.props.navigation.getParam('mode')
    return (
      <Container>
        <TitleBar title={strings(`wallet.${mode}`)} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 23 }}>
          <Text
            style={{
              marginVertical: 20,
              fontSize: 23,
              fontWeight: '500',
            }}>
            {strings('wallet.policy')}
          </Text>
          <Text>Coming soon</Text>
          <Flex
            style={{
              marginVertical: 56,
            }}>
            <Checkbox.AgreeItem
              checkboxStyle={{
                fontSize: 15,
              }}
              checked={this.state.hasRead}
              onChange={event => {
                this.setState({ hasRead: event.target.checked })
              }}>
              {strings('wallet.readPolicy')}
            </Checkbox.AgreeItem>
          </Flex>
          <Button
            type="primary"
            style={{ marginVertical: 26 }}
            onPress={() => {
              if (this.state.hasRead) {
                GlobalNavigation.navigate('NameWallet', {
                  mode: this.props.navigation.state.params.mode,
                })
              } else {
                alert('Please agree the policy')
              }
            }}>
            {strings('next')}
          </Button>
        </ScrollView>
      </Container>
    )
  }
}

export default PrivacyPolicies
