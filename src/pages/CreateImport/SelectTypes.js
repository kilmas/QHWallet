import React from 'react'
import { Image, Text, TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { inject, observer } from 'mobx-react'
import { Flex, Icon } from '@ant-design/react-native'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import { styles as themeStyle } from '../../theme'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { getIcon } from '../../stores/wallet/Coin'

const btns = [
  {
    icon: { uri: getIcon('BTC') },
    name: 'BTC',
    type: 'BTC',
  },
  {
    icon: { uri: getIcon('ETH') },
    name: 'ETH',
    type: 'ETH',
  },
  {
    icon: { uri: getIcon('FO') },
    name: 'FO',
    type: 'FO',
  },
  {
    icon: { uri: getIcon('OKT') },
    name: 'OKT',
    type: 'OKT',
  },
  {
    icon: { uri: getIcon('EOS') },
    name: 'EOS',
    type: 'EOS',
  },
  {
    icon: { uri: getIcon('TRX') },
    name: 'TRX',
    type: 'TRX',
  },
]

@inject('store')
@observer
class SelectTypes extends React.Component {
  state = {
    password: '',
  }

  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.import')} />
        <KeyboardAwareScrollView style={themeStyle.pt26}>
          {btns.map(({ icon, name, type }, index) => (
            <TouchableOpacity
              key={index.toString()}
              onPress={() =>
                GlobalNavigation.navigate('InputPrivateKey', {
                  type,
                  name: this.props.navigation.state.params.name,
                })
              }>
              <Flex
                style={{
                  backgroundColor: '#F0F7FF',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 15,
                  marginBottom: 15,
                  borderRadius: 5,
                }}>
                <Image
                  source={icon}
                  resizeMode="contain"
                  style={{
                    width: 25,
                    height: 25,
                    marginRight: 25,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: '#4a4a4a',
                    flex: 1,
                  }}>
                  {name}
                </Text>
                <Icon name="right" />
              </Flex>
            </TouchableOpacity>
          ))}
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

export default SelectTypes
