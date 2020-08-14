import React from 'react'
import { Text } from 'react-native'
import { inject, observer } from 'mobx-react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button, Icon } from '@ant-design/react-native'
import Container from '../../components/Container'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { styles as themeStyles } from '../../theme'

@inject('store')
@observer
class CreateWalletSuccess extends React.Component {
  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.create')} renderLeft={() => null} />
        <KeyboardAwareScrollView
          contentContainerStyle={{
            ...themeStyles.pt26,
            minHeight: 500,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="check" size={50} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '500',
              color: '#0A113B',
              marginBottom: 15,
              marginTop: 20,
            }}>
            {strings('wallet.createSuccess')}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#4A4A4A',
              alignSelf: 'center',
              marginBottom: 30,
            }}>
            {strings('wallet.notesSuccess')}
          </Text>

          <Button
            type="primary"
            style={{
              margin: 18,
              width: '100%',
            }}
            onPress={() =>
              GlobalNavigation.navigate('BackupWallet', {
                mnemonics: this.props.navigation.state.params.mnemonics,
              })
            }>
            {strings('wallet.backupNow')}
          </Button>
          <Button
            type="primary"
            style={{
              margin: 18,
              width: '100%',
            }}
            onPress={() =>
              GlobalNavigation.reset('TabDrawer')
            }>
            {strings('wallet.skip')}
          </Button>
        </KeyboardAwareScrollView>
      </Container>
    )
  }
}

export default CreateWalletSuccess;
