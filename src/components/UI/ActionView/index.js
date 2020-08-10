import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@ant-design/react-native'
import { Keyboard, StyleSheet, View, TouchableWithoutFeedback } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { baseStyles } from '../../../styles/common'
import { strings } from '../../../locales/i18n'

const styles = StyleSheet.create({
  actionContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    minWidth: 150,
  },
  cancel: {
    marginRight: 8,
  },
  confirm: {
    marginLeft: 8,
  },
})

/**
 * PureComponent that renders scrollable content above configurable buttons
 */
export default function ActionView({
  cancelTestID,
  confirmTestID,
  cancelText,
  children,
  confirmText,
  confirmButtonMode,
  onCancelPress,
  onConfirmPress,
  onTouchablePress,
  showCancelButton,
  showConfirmButton,
  confirmed,
  confirmDisabled,
  keyboardShouldPersistTaps = 'never',
}) {
  return (
    <View style={baseStyles.flexGrow}>
      <KeyboardAwareScrollView style={baseStyles.flexGrow} resetScrollToCoords={{ x: 0, y: 0 }} contentContainerStyle={{height: '100%'}} keyboardShouldPersistTaps={keyboardShouldPersistTaps}>
        <TouchableWithoutFeedback
          style={baseStyles.flexGrow}
          onPress={() => {
            if (keyboardShouldPersistTaps === 'handled') {
              Keyboard.dismiss()
            }
            onTouchablePress && onTouchablePress()
          }}>
          {children}
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
      <View style={styles.actionContainer}>
        {showCancelButton && (
          <Button
            testID={cancelTestID}
            type={confirmButtonMode === 'sign' ? 'ghost' : 'warning'}
            onPress={onCancelPress}
            style={styles.button}
            disabled={confirmed}>
            {cancelText}
          </Button>
        )}
        {showConfirmButton && (
          <Button
            testID={confirmTestID}
            style={styles.button}
            type="primary"
            loading={confirmed}
            onPress={onConfirmPress}
            disabled={confirmed || confirmDisabled}>
            {confirmed ? 'Activity' : confirmText}
          </Button>
        )}
      </View>
    </View>
  )
}

ActionView.defaultProps = {
  cancelText: strings('action_view.cancel'),
  confirmButtonMode: 'normal',
  confirmText: strings('action_view.confirm'),
  confirmTestID: '',
  confirmed: false,
  cancelTestID: '',
  showCancelButton: true,
  showConfirmButton: true,
}

ActionView.propTypes = {
  /**
   * TestID for the cancel button
   */
  cancelTestID: PropTypes.string,
  /**
   * TestID for the confirm button
   */
  confirmTestID: PropTypes.string,
  /**
   * Text to show in the cancel button
   */
  cancelText: PropTypes.string,
  /**
   * Content to display above the action buttons
   */
  children: PropTypes.node,
  /**
   * Type of button to show as the confirm button
   */
  confirmButtonMode: PropTypes.oneOf(['ghost', 'primary', 'warning']),
  /**
   * Text to show in the confirm button
   */
  confirmText: PropTypes.string,
  /**
   * Whether action view was confirmed in order to block any other interaction
   */
  confirmed: PropTypes.bool,
  /**
   * Whether action view confirm button should be disabled
   */
  confirmDisabled: PropTypes.bool,
  /**
   * Called when the cancel button is clicked
   */
  onCancelPress: PropTypes.func,
  /**
   * Called when the confirm button is clicked
   */
  onConfirmPress: PropTypes.func,
  /**
   * Called when the touchable without feedback is clicked
   */
  onTouchablePress: PropTypes.func,

  /**
   * Whether cancel button is shown
   */
  showCancelButton: PropTypes.bool,
  /**
   * Whether confirm button is shown
   */
  showConfirmButton: PropTypes.bool,
  /**
   * Determines if the keyboard should stay visible after a tap
   */
  keyboardShouldPersistTaps: PropTypes.string,
}
