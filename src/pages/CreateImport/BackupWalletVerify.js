import React from 'react';
import { Image, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Flex, Toast, Button } from '@ant-design/react-native';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import { styles as themeStyles, BDCoLor, BGGray } from '../../theme';
import GlobalNavigation from '../../utils/GlobalNavigation';

export default class BackupWalletVerify extends React.Component {
  constructor(props) {
    super(props);
    const privateKey = props.navigation.getParam('privateKey')
    const mnemonics = props.navigation.getParam('mnemonics')
    let randomMnemonics = []
    if (mnemonics) {
      randomMnemonics = mnemonics.sort((a, b) => (Math.random() > 0.5 ? -1 : 1));
    }
    this.state = {
      privateKey,
      mnemonics,
      randomMnemonics,
      list: new Array(12).fill(''),
    };
  }

  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.backupWallet')} />
        <KeyboardAwareScrollView contentContainerStyle={themeStyles.pt26}>
          <Text
            style={{
              fontSize: 19,
              marginBottom: 20,
            }}>
            {strings('wallet.verifyPhrase')}
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: '#4A4A4A',
              alignSelf: 'flex-start',
              marginBottom: 20,
            }}>
            {strings('wallet.notesVerify')}
          </Text>
          {
            this.state.mnemonics && <>
              <Flex
                justify={'between'}
                wrap={'wrap'}>
                {this.state.list.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: "33.3%",
                    }}
                    onPress={async () => {
                      this.state.list[index] = '';
                      this.setState({});
                    }}>
                    <Flex
                      style={{
                        height: 40,
                        backgroundColor: BGGray,
                        ...themeStyles.border,
                      }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#333',
                          // width: 15,
                          marginHorizontal: 6,
                        }}>
                        {index + 1}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: BDCoLor,
                          flex: 1
                        }}>
                        {item}
                      </Text>
                    </Flex>
                  </TouchableOpacity>
                ))}
              </Flex>

              <Flex
                style={{ marginVertical: 15 }}
                justify={'between'}
                wrap={'wrap'}>
                {this.state.randomMnemonics.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: "25%",
                      height: 30,
                    }}
                    onPress={() => {
                      const i = this.state.list.indexOf('');
                      this.state.list[i] = item;
                      this.setState({});
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: BDCoLor,
                        textAlign: 'center'
                      }}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Flex>
            </>
          }
          {
            this.state.privateKey && <TextInput
              style={{
                backgroundColor: BGGray,
                marginBottom: 30
              }}
              keyboardType="numeric"
              numberOfLines={3}
              onChangeText={(value)=>{
                this.setState({
                  checkKey: value
                })
              }}
              defaultValue={this.state.checkKey}
            />
          }
          <Button
            type="primary"
            onPress={async () => {
              const rawList = this.state.mnemonics;
              if (
                this.state.list.sort().toString() === rawList.sort().toString()
              ) {
                Toast.success(strings('wallet.backupSuccess'));
                GlobalNavigation.reset('TabDrawer');
              } else {
                Toast.fail(strings('Re-Enter'))
              }
            }}
          >{strings('confirm')}</Button>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}
