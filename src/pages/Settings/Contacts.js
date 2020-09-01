import React from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { inject, observer } from 'mobx-react'
import { Flex, Button, WingBlank, Icon } from '@ant-design/react-native'
import TitleBar from '../../components/TitleBar'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import { styles, LGColor, BGGray } from '../../theme'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { computed } from 'mobx'

@inject('store')
@observer
class Contacts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      back: false,
    }
  }

  @computed get contacts() {
    return this.props.store.settings.contacts
  }

  render() {
    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar title={strings('settings.contacts')} />
        <WingBlank style={{ flexDirection: 'column', justifyContent: 'space-around', flex: 1, paddingVertical: 50 }}>
          {this.contacts.length > 0 ? (
            <FlatList
              data={this.contacts}
              keyExtractor={(item, index) => index}
              renderItem={({ item: { name, address }, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (this.props.navigation.state.params.mode === 'get') {
                      GlobalNavigation.goBack()
                      this.props.navigation.state.params.onSave(address)
                    }
                  }}>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 10,
                      padding: 10,
                    }}>
                    <Flex>
                      <Text>{strings('settings.name')}:</Text>
                      <Text style={{ flex: 1 }}>{name}</Text>
                    </Flex>

                    <Flex style={{ marginTop: 22 }}>
                      <Text>{strings('settings.address')}:</Text>
                      <Text style={{width: 280}}>{address}</Text>
                    </Flex>
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 15, right: 15 }}
                      onPress={() => {
                        this.props.store.settings.removeContacts(index)
                      }}>
                      <Icon name="close" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View
              style={{
                alignItems: 'center',
                minHeight: 200,
                justifyContent: 'space-around',
              }}>
              <Icon name="exclamation-circle" size={100} />
              <Text>no contacts yet</Text>
            </View>
          )}
          <Button type="primary" onPress={() => GlobalNavigation.navigate('AddContacts')}>
            {strings('settings.addContacts')}
          </Button>
        </WingBlank>
      </Container>
    )
  }
}

export default Contacts

