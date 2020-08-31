import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Radio } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import TitleBar from '../../components/TitleBar'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { BGGray } from '../../theme'
import CoinStore from '../../stores/wallet/CoinStore'

@inject('store')
@observer
class Currency extends React.Component {
  state = {
    currency: {
      name: 'USD',
      unit: '$',
    },
    list: [
      {
        name: 'CNY',
        unit: '¥',
      },
      {
        name: 'USD',
        unit: '$',
      },
    ],
  }

  async componentDidMount() {
    this.setState({
      currency: {
        name: CoinStore.currency,
        unit: CoinStore.currencySymbol,
      },
    })
  }

  render() {
    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar
          blueBottom={true}
          title={strings('settings.currency')}
          renderRight={() => (
            <TouchableOpacity
              onPress={async () => {
                // this.props.store.settings.setCurrency(this.state.currency)
                CoinStore.setCurrency(this.state.currency.name)
                GlobalNavigation.goBack()
              }}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{strings('save')}</Text>
            </TouchableOpacity>
          )}
        />
        {this.state.list.map(({ name, unit }, index) => (
          <Radio.RadioItem
            key={index.toString()}
            checked={this.state.currency.name === name}
            onChange={event => {
              if (event.target.checked) {
                this.setState({ currency: { name, unit } })
              }
            }}>
            {name}
          </Radio.RadioItem>
        ))}
      </Container>
    )
  }
}

export default Currency
