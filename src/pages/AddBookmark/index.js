import React from 'react'
import { SafeAreaView, Text, TextInput, View, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import { colors, fontStyles } from '../../styles/common'
import { strings } from '../../locales/i18n'
import ActionView from '../../components/UI/ActionView'
import TitleBar from '../../components/TitleBar'
import Container from '../../components/Container'

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1,
  },
  rowWrapper: {
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.grey100,
    padding: 16,
    ...fontStyles.normal,
  },
  warningText: {
    color: colors.red,
    ...fontStyles.normal,
  },
})

/**
 * Copmonent that provides ability to add a bookmark
 */
export default class AddBookmark extends React.Component {
  state = {
    title: '',
    url: '',
  }

  static propTypes = {
    /**
		/* navigation object required to push new views
		*/
    navigation: PropTypes.object,
  }

  componentDidMount() {
    this.loadInitialValues()
  }

  loadInitialValues() {
    const { navigation } = this.props
    this.setState({
      title: navigation.getParam('title', ''),
      url: navigation.getParam('url', ''),
    })
  }

  addBookmark = () => {
    const { title, url } = this.state
    if (title === '' || url === '') return false
    this.props.navigation.state.params.onAddBookmark({ name: title, url })
    this.props.navigation.pop()
  }

  cancelAddBookmark = () => {
    this.props.navigation.pop()
  }

  onTitleChange = title => {
    this.setState({ title })
  }

  onUrlChange = url => {
    this.setState({ url })
  }

  urlInput = React.createRef()

  jumpToUrl = () => {
    const { current } = this.urlInput
    current && current.focus()
  }

  render = () => (
    <Container>
      <TitleBar title={strings('add_favorite.title')} />

      <SafeAreaView style={styles.wrapper} testID={'add-bookmark-screen'}>
        <ActionView
          cancelText={strings('add_favorite.cancel_button')}
          confirmText={strings('add_favorite.add_button')}
          onCancelPress={this.cancelAddBookmark}
          onConfirmPress={this.addBookmark}>
          <View>
            <View style={styles.rowWrapper}>
              <Text style={fontStyles.normal}>{strings('add_favorite.title_label')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={''}
                placeholderTextColor={colors.grey100}
                value={this.state.title}
                onChangeText={this.onTitleChange}
                testID={'add-bookmark-title'}
                onSubmitEditing={this.jumpToUrl}
                returnKeyType={'next'}
              />
              <Text style={styles.warningText}>{this.state.warningSymbol}</Text>
            </View>
            <View style={styles.rowWrapper}>
              <Text style={fontStyles.normal}>{strings('add_favorite.url_label')}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={''}
                value={this.state.url}
                onChangeText={this.onUrlChange}
                testID={'add-bookmark-url'}
                ref={this.urlInput}
                onSubmitEditing={this.addToken}
                returnKeyType={'done'}
              />
              <Text style={styles.warningText}>{this.state.warningDecimals}</Text>
            </View>
          </View>
        </ActionView>
      </SafeAreaView>
    </Container>
  )
}
