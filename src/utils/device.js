import { Dimensions, Platform, Keyboard, StatusBar } from 'react-native'
import DeviceInfo from 'react-native-device-info'

// iPhoneX
const X_WIDTH = 375
const X_HEIGHT = 812
let { width, height } = Dimensions.get('window')

export function isIPhoneX() {
  return Platform.OS === 'ios' && ((height >= X_HEIGHT && width >= X_WIDTH) || (height >= X_WIDTH && width >= X_HEIGHT))
}

const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    return isIPhoneX() ? 40 : 20
  }
  return Platform.Version >= 21 ? StatusBar.currentHeight : 0
}

const statusBarHeight = getStatusBarHeight()

export const apx = (size = 0) => (width / 750) * size

const deviceWidth = width
const deviceHeight = height

export { deviceWidth, deviceHeight, statusBarHeight }

export const dismissKeyboard = Keyboard.dismiss

Dimensions.addEventListener('change', e => {
  width = e.window.width
  height = e.window.height
})

let installID
let deviceID

const DEVICE_ID_KEY = 'DEVICE_ID_KEY'

export { installID, deviceID }

class Device {
  generateUUID = () => {
    const UUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
      .toUpperCase()
    console.log(UUID)
    return UUID
  }
  get isAndroid() {
    return Platform.OS === 'android'
  }
  get isIOS() {
    return Platform.OS === 'ios'
  }
  async getScreenBrightness() {}
  /**
   * 请用getDeviceId
   */
  async installID() {
    if (installID) {
      return installID
    }
    try {
      installID = await AsyncStorage.getItem(DEVICE_ID_KEY)
      if (!installID) {
        installID = this.generateUUID()
        AsyncStorage.setItem(DEVICE_ID_KEY, installID)
        return installID
      }
    } catch (error) {}
    return installID
  }
  get idfa() {}
  get isIPhoneX() {
    return Platform.OS === 'ios' && (height == 812 || height == 896)
  }
  get tabBarHeight() {
    return Platform.select({
      ios: this.isIPhoneX ? 83 : 49,
      android: 49,
    })
  }
  get statusBarHeight() {
    return Platform.select({
      ios: this.isIPhoneX ? 44 : 20,
      android: 0,
    })
  }
  get navBarHeight() {
    return this.isIPhoneX ? 88 : 64
  }
  get iPhoneXSafeArea() {
    return {
      bottom: 34,
    }
  }
  get safeArea() {
    if (this.isIPhoneX) {
      return {
        bottom: 34,
      }
    }
    return {
      bottom: 0,
    }
  }
  get windowSize() {
    return {
      width: Math.ceil(width),
      height: Platform.select({ ios: height, android: height - 20 }),
    }
  }
  get screenSize() {
    return Dimensions.get('screen')
  }
  get name() {
    return `${DeviceInfo.getBrand()} ${DeviceInfo.getDeviceId()}`
  }
}

export default new Device()
