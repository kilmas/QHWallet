import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { inject, observer } from 'mobx-react';
import { computed } from "mobx";
import { Badge, Flex, Icon } from '@ant-design/react-native';
import TitleBar from '../../components/TitleBar';
import { strings } from '../../locales/i18n';
import GlobalNavigation from '../../utils/GlobalNavigation';
import { LGColor, BGGray } from '../../theme';
import Container from '../../components/Container';
import LinearGradient from 'react-native-linear-gradient';

const btns = [
  {
    icon: "font-size",
    name: strings('settings.language'),
    navigation: 'Language',
  },
  {
    icon: "account-book",
    name: strings('settings.contacts'),
    navigation: 'Contacts',
    params: { mode: 'save' },
  },
  {
    icon: "dollar",
    name: strings('settings.currency'),
    navigation: 'Currency',
  },
  {
    icon: "info-circle",
    name: strings('settings.aboutUs'),
    navigation: 'AboutUs',
  },
  {
    icon: "security-scan",
    name: strings('settings.security'),
    navigation: 'Security',
  },
];
@inject('store')
@observer
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: props.store.settings.username,
      email: props.store.settings.email,
    };
  }

  render() {
    return (
      <Container>
        <TitleBar title={strings('tab.Settings')}/>
        <ScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={LGColor}
            useAngle={true}
            angle={90}
            angleCenter={{ x: 0.5, y: 0 }}
            style={styles.linearGrad}>
            <TouchableOpacity
              onPress={() =>
                GlobalNavigation.navigate('Profile', {
                  onSave: () => {
                    this._refresh();
                  },
                })
              }>
              <Flex style={styles.titleFlex}>
                <Icon name="user" size={50}/>
                <View style={styles.titleUser}>
                  <Text style={styles.titleText}>
                    {this.props.store.settings.username || 'User'}
                  </Text>
                  <Text style={styles.titleEmail}>
                    {this.props.store.settings.email || 'Bind your email'}
                  </Text>
                </View>
              </Flex>
            </TouchableOpacity>
          </LinearGradient>
          <Flex wrap="wrap" justify="between" style={styles.btnsFlex}>
            {btns.map(({ icon, name, navigation, params }, index) => (
              <TouchableOpacity key={index.toString()}
                onPress={() => {
                  GlobalNavigation.navigate(navigation, params)
                }}>
                <Flex style={styles.btnFlex}>
                  <Badge dot={index === 3 && this.props.store.common.newVersion}>
                    <Icon name={icon} size={30} />
                  </Badge>
                  <Text style={styles.btnText}>
                    {name}
                  </Text>
                </Flex>
              </TouchableOpacity>
            ))}
          </Flex>
        </ScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  content: { backgroundColor: BGGray,flex: 1 },
  linearGrad: {
    height: 150,
    borderColor: '#E0E0E0',
  },
  titleFlex: { marginTop: 15, marginLeft: 27 },
  titleImg: {
    width: 45,
    height: 45,
    borderRadius: 45,
  },
  titleUser: {
    marginLeft: 17,
    height: 45,
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 20,
    color: '#fff',
  },
  titleEmail: {
    fontSize: 17,
    color: '#fff',
  },
  btnsFlex: { padding: 22 },
  btnFlex: {
    backgroundColor: '#fff',
    width: 160,
    height: 112,
    borderRadius: 5,
    marginBottom: 16,
    paddingLeft: 10
  },
  btnImg: {
    width: 36,
    height: 36,
    marginLeft: 15,
  },
  btnText: {
    flex: 1,
    fontSize: 16,
    color: '#666a81',
    marginLeft: 15,
  }
});

export default Settings;
