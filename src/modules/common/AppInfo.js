import DeviceInfo from 'react-native-device-info'
import { Platform, Linking } from 'react-native'
import { isObject } from 'lodash'
import { observable, computed } from 'mobx'
import _ from 'lodash'
import { Modal } from '@ant-design/react-native'

const ENV = {
  JS_VERSION: process.env.RN_JS_VERSION,
  CID: process.env.RN_CID,
  SENTRY_DSN: process.env.RN_SENTRY_DSN,
}

class AppInfo {
  @observable hasNewerVersion = false
  get bundleId() {
    return DeviceInfo.getBundleId()
  }
  get commitId() {
    return ENV.CID
  }

  get sentryDSN() {
    return ENV.SENTRY_DSN
  }

  /**
   *'1.0.1
   * 最后一位是两位
   * @readonly
   * @type {string}
   * @memberof AppInfo
   */
  @computed get version() {
    return `${DeviceInfo.getVersion()}`
  }
  /**
   *100001
   * 点变成0
   * @readonly
   * @type {number}
   * @memberof AppInfo
   */
  @computed get versionCode() {
    return parseInt(DeviceInfo.getBuildNumber())
  }
  get jsVersion() {
    return ENV.JS_VERSION
  }
  get userAgent() {
    return DeviceInfo.getUserAgent()
  }
  checkUpdate = async () => {
    try {
      const data = await fetch('https://dapp.bitewd.com/version.json').then(r => r.json())

      if (!isObject(data)) {
        return false
      }

      const platform = Platform.OS
      const version = data[`${platform}_version`]
      const versionCode = data[`${platform}_version_code`]
      const content = data[`${platform}_version_content`]
      const minimumCode = data[`${platform}_minimum_version_code`]
      const downloadUrl = data[`${platform}_download_url`]

      const needUpdate = versionCode > this.versionCode
      this.hasNewerVersion = needUpdate
      if (!needUpdate) {
        return false
      }

      const force = minimumCode > this.versionCode

      const ok = {
        text: 'OK',
        onPress: () => {
          this.install(downloadUrl)
        },
      }
      setTimeout(() => {
        Modal.alert(
          `Update to ${version}`,
          content,
          !force
            ? [
                {
                  text: 'Cancel',
                  onPress: () => console.log('cancel'),
                  style: 'cancel',
                },
                ok,
              ]
            : [ok]
        )
      }, 1000)
      return true
    } catch (error) {
      console.warn(error)
    }

    return false
  }
  install(path) {
    Linking.openURL(path)
  }
}

export default new AppInfo()
