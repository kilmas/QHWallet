import React from 'react'
import { Image, View, Text, TouchableOpacity } from 'react-native'
import { inject, observer } from 'mobx-react'
import { Flex, Button } from '@ant-design/react-native'
import Container from '../../components/Container'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { styles as themeStyles, BDCoLor, SecondaryColor } from '../../theme'
import { strings } from '../../locales/i18n'

@inject('store')
@observer
class Welcome extends React.Component {
  state = {
    step: 0,
  }

  async reset() {
    GlobalNavigation.reset('CreateImportWallet')
  }

  render() {
    return (
      <Container>
        <View style={themeStyles.center}>
          <Image
            source={
              this.state.step === 0
                ? require('../../images/Common/open_source.png')
                : this.state.step === 1
                ? require('../../images/Common/decentralized.png')
                : require('../../images/Common/fund.png')
            }
            resizeMode={'contain'}
            style={{
              marginBottom: 10,
              width: 184,
              height: 234,
              marginTop: 75,
            }}
          />
          <Flex style={{ marginTop: 20, marginBottom: 25 }}>
            {[1, 2, 3].map((item, index) => (
              <View
                key={index.toString()}
                style={{
                  backgroundColor: index === this.state.step ? BDCoLor : '#d1d1d2',
                  height: 5,
                  width: index === this.state.step ? 32 : 20,
                  marginHorizontal: index === 1 ? 20 : 0,
                  borderRadius: 6,
                }}
              />
            ))}
          </Flex>
        </View>

        <Text
          style={{
            fontSize: 22,
            color: SecondaryColor,
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: 15,
          }}>
          {this.state.step === 0 ? 'Open Sourse' : this.state.step === 1 ? 'Decentralized' : 'Just for fun'}
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: SecondaryColor,
            textAlign: 'center',
          }}>
          {this.state.step === 0 ? strings('welcome.step1') : this.state.step === 1 ? strings('welcome.step2') : strings('welcome.step3')}
        </Text>

        {this.state.step !== 2 ? (
          <Flex style={{ paddingBottom: 20, flex: 1 }} justify={'between'} align={'end'}>
            <TouchableOpacity onPress={() => this.reset()} style={{ width: 100, height: 38, ...themeStyles.center }}>
              <Text
                style={{
                  color: '#666A81',
                  fontSize: 15,
                }}>
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  step: this.state.step + 1,
                })
              }
              style={{ width: 100, height: 38, ...themeStyles.center }}>
              <Text
                style={{
                  color: BDCoLor,
                  fontSize: 15,
                  fontWeight: '500',
                }}>
                Next
              </Text>
            </TouchableOpacity>
          </Flex>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', padding: 26 }}>
            <Button type="primary" onPress={this.reset}>
              Next
            </Button>
          </View>
        )}
      </Container>
    )
  }
}

export default Welcome
