import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Radio } from '@ant-design/react-native'
import { inject, observer } from 'mobx-react'
import i18n from 'react-native-i18n'
import TitleBar from '../../components/TitleBar'
import { strings } from '../../locales/i18n'
import Container from '../../components/Container'
import GlobalNavigation from '../../utils/GlobalNavigation'
import { BGGray } from '../../theme'

@inject('store')
@observer
class Language extends React.Component {
  state = {
    language: {
      name: 'English',
      locale: 'en',
    },
    list: [
      {
        name: 'English',
        locale: 'en',
      },
      {
        name: '简体中文',
        locale: 'zh',
      },
    ],
  }

  async componentDidMount() {
    this.setState({ language: this.props.store.settings.language })
  }

  render() {
    const { language } = this.state
    return (
      <Container style={{ backgroundColor: BGGray }}>
        <TitleBar
          title={strings('settings.language')}
          blueBottom={true}
          renderRight={() => (
            <TouchableOpacity
              onPress={async () => {
                i18n.locale = language.locale
                this.props.store.settings.setLanguage(language)
                GlobalNavigation.reset('Splash')
              }}>
              <Text style={{ color: '#fff', fontSize: 15 }}>{strings('save')}</Text>
            </TouchableOpacity>
          )}
        />
        {this.state.list.map(({ name, locale }, index) => (
          <Radio.RadioItem
            key={index.toString()}
            checked={language.name === name}
            onChange={event => {
              if (event.target.checked) {
                this.setState({ language: { name, locale } })
              }
            }}>
            {name}
          </Radio.RadioItem>
        ))}
      </Container>
    )
  }
}
export default Language
