import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { inject, observer } from 'mobx-react';
import { Flex, Icon } from '@ant-design/react-native';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import { styles as themeStyle } from '../../theme';
import GlobalNavigation from '../../utils/GlobalNavigation';
import Coin from '../../stores/wallet/Coin';

const btns = [
  {
    icon: { uri: Coin.getIcon('BTC') },
    name: 'BTC',
    type: 'BTC',
    backgroundColor: '#F0F7FF',
  },
  {
    icon: { uri: Coin.getIcon('ETH') },
    name: 'ETH',
    type: 'ETH',
    backgroundColor: '#F0F7FF',
  },
  {
    icon: { uri: Coin.getIcon('FO') },
    name: 'FO',
    type: 'FO',
    backgroundColor: '#F0F7FF',
  },
  {
    icon: { uri: Coin.getIcon('OKT') },
    name: 'OKT',
    type: 'OKT',
    backgroundColor: '#F0F7FF',
  },
];

export default
@inject('store')
@observer
class SelectTypes extends React.Component {
  state = {
    password: '',
  };

  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.import')} />
        <KeyboardAwareScrollView style={themeStyle.pt26}>
          {btns.map(
            ({ icon, name, type, backgroundColor, width, height }, index) => (
              <TouchableOpacity key={index.toString()} onPress={() =>
                GlobalNavigation.navigate('InputPrivateKey', {
                  type,
                  name: this.props.navigation.state.params.name,
                })
              }>
                <Flex
                  style={{
                    backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 20,
                    marginBottom: 26,
                  }}>
                  <Image
                    source={icon}
                    resizeMode={'contain'}
                    style={{
                      width: 25,
                      height: 25,
                      marginHorizontal: 25,
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

            ),
          )}
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}
