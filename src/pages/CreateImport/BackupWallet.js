import React from 'react';
import { Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import { Button, Flex } from '@ant-design/react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { styles, BDCoLor, BGGray } from '../../theme';

@inject('store')
@observer
class BackupWallet extends React.Component {
  constructor(props) {
    super(props);
    const mnemonics = props.navigation.getParam('mnemonics');
    const privateKey = props.navigation.getParam('privateKey')
    this.state = {
      mnemonics,
      privateKey,
    };
  }



  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.backupWallet')} />
        <KeyboardAwareScrollView contentContainerStyle={styles.pt26}>
          <Text
            style={{
              fontSize: 19,
            }}>
            {strings('wallet.writeDownPhrase')}
          </Text>
          {this.state.mnemonics &&
            <Flex
              style={{ marginVertical: 30 }}
              justify={'start'}
              wrap={'wrap'}>
              {this.state.mnemonics.map((item, index) => (
                <Flex
                  key={index}
                  style={{
                    width: '33.2%',
                    height: 45,
                    backgroundColor: BGGray,
                    borderColor: '#e0e0e0',
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: '#333',
                      marginHorizontal: 6,
                    }}>
                    {index + 1}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: BDCoLor,
                    }}>
                    {item}
                  </Text>
                </Flex>
              ))}
            </Flex>
          }
          {this.state.privateKey && <Text
            style={{
              marginVertical: 30,
              fontSize: 13,
              color: BDCoLor,
            }}>
            {this.state.privateKey}
          </Text>}
          <Text
            style={{
              fontSize: 13,
              color: '#4A4A4A',
              alignSelf: 'flex-start',
              marginVertical: 30,
            }}>
            {strings('wallet.notesBackup')}
          </Text>
          <Button
            type="primary"
            onPress={() => {
              GlobalNavigation.navigate('BackupWalletVerify', {
                mnemonics: this.state.mnemonics,
                privateKey: this.state.privateKey,
              })
            }}
          >{strings('next')}</Button>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

export default BackupWallet;
