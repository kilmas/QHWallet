import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Flex, Icon } from '@ant-design/react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles, LGColor, SecondaryColor } from '../../theme';
import TitleBar from '../../components/TitleBar';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { strings } from '../../locales/i18n';
import Container from '../../components/Container';
import ClearTitleBar from '../../components/ClearTitleBar';

export default class AddWallet extends React.Component {
  render() {
    return (
      <Container style={{ backgroundColor: SecondaryColor }}>
        <LinearGradient
          colors={LGColor}
          useAngle={true}
          angle={73.36}
          angleCenter={{ x: 0.5, y: 0 }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: "space-between"
          }}>
          <ClearTitleBar title="" />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                GlobalNavigation.navigate('PrivacyPolicies', { mode: 'create' });
              }}>
              <View
                style={{
                  width: 300,
                  height: 160,
                  borderRadius: 17,
                  backgroundColor: '#419EFF',
                  ...styles.center,
                }}>
                <Icon name="credit-card" size={50}/>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: SecondaryColor,
                  }}>
                  {strings('wallet.create')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginVertical: 60 }}
              onPress={() => {
                GlobalNavigation.navigate('PrivacyPolicies', { mode: 'import' });
              }}>
              <View
                style={{
                  width: 300,
                  height: 160,
                  borderRadius: 17,
                  backgroundColor: '#419EFF',
                  ...styles.center,
                }}>
                <Icon name="import" size={50} />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: SecondaryColor,
                  }}>
                  {strings('wallet.import')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </Container>
    );
  }
}
