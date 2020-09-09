import React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native'
import Container from '../../components/Container'
import { styles as themeStyles, BGGray } from '../../theme'
import { strings } from '../../locales/i18n'
import TitleBar from '../../components/TitleBar'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { inject, observer } from 'mobx-react'

@inject('store')
@observer
class CreateNameWallet extends React.Component {
  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.nameWallet')} />
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{strings('wallet.nameWallet')}</Text>
          <TextInput style={styles.textInput} placeholder={'QHWallet-Wallet'} />
          <TouchableOpacity
            style={themeStyles.btnPrimary}
            onPress={() => {
              GlobalNavigation.navigate('AddWallet')
            }}>
            <Text style={themeStyles.btnPrimaryText}>{strings('next')}</Text>
          </TouchableOpacity>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 23,
    paddingVertical: 18,
  },
  contentTitle: {
    fontSize: 23,
    fontWeight: '500',
    color: '#0A113B',
    alignSelf: 'flex-start',
  },
  textInput: {
    width: 320,
    height: 44,
    backgroundColor: BGGray,
    borderRadius: 5,
    marginTop: 25,
    marginBottom: 50,
    paddingHorizontal: 13,
    color: '#000000',
  },
})

export default CreateNameWallet
