import React from 'react';
import {
  Image,
  Text,
  ImageBackground,
  TouchableOpacity,
  View,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Icon, Flex } from '@ant-design/react-native';
import LinearGradient from 'react-native-linear-gradient'
import Container from '../../components/Container';
import { styles, LGColor, BDCoLor, SecondaryColor } from '../../theme';
import { strings } from '../../locales/i18n';
import GlobalNavigation from '../../utils/GlobalNavigation';

@inject('store')
@observer
class CreateImportWallet extends React.Component {
  render() {
    return (
      <Container style={{ backgroundColor: BDCoLor }}>
        <LinearGradient
          colors={LGColor}
          useAngle={true}
          angle={73.36}
          angleCenter={{ x: 0.5, y: 0 }}
          style={{
            height: '100%',
            justifyContent: 'center',
          }}>
          <Flex justify="around">
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                GlobalNavigation.navigate('PrivacyPolicies', { mode: 'create' });
              }}>
              <Icon name="credit-card" size={50} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: SecondaryColor,
                }}>
                {strings('wallet.create')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                GlobalNavigation.navigate('PrivacyPolicies', { mode: 'import' });
              }}>
              <Icon name="import" size={50} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: SecondaryColor,
                }}>
                {strings('wallet.import')}
              </Text>
            </TouchableOpacity>
          </Flex>

        </LinearGradient>
      </Container>
    );
  }
}

export default CreateImportWallet;
