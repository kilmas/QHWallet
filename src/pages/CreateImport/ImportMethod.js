import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { inject, observer } from 'mobx-react';
import { Flex, Icon } from '@ant-design/react-native';
import Container from '../../components/Container';
import { strings } from '../../locales/i18n';
import TitleBar from '../../components/TitleBar';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { BDCoLor } from '../../theme';

export default
@inject('store')
@observer
class ImportMethod extends React.Component {
  render() {
    return (
      <Container>
        <TitleBar title={strings('wallet.import')} />
        <KeyboardAwareScrollView
          style={{
            paddingHorizontal: 23,
          }}>
          <Text style={styles.title}>
            {strings('wallet.selectMethod')}
          </Text>
          {[{
            name: strings('wallet.phrases'),
            onPress: () =>
              GlobalNavigation.navigate('InputPhrases', {
                name: this.props.navigation.state.params.name,
                password: this.props.navigation.state.params.password,
              })
          },
          {
            name: strings('wallet.privateKey'),
            onPress: () =>
              GlobalNavigation.navigate('SelectTypes', {
                name: this.props.navigation.state.params.name,
              })
          }
          ].map(item => <TouchableOpacity key={item.name} onPress={item.onPress}>
            <Flex
              style={styles.touchItem}
              justify={'between'}>
              <Text style={styles.itemText}>
                {item.name}
              </Text>
              <Icon name="right" />
            </Flex>
          </TouchableOpacity>)}

        </KeyboardAwareScrollView>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
  title: {
    fontSize: 19,
    color: '#4a4a4a',
    marginVertical: 20,
  },
  touchItem: {
    backgroundColor: BDCoLor,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#fff',
  },
});