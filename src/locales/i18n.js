import ReactNative from 'react-native';
import I18n from 'react-native-i18n';
import zh from './zh';
import en from './en';

I18n.fallbacks = true;

I18n.translations = {
  en,
  zh,
};

export const currentLocale = I18n.currentLocale();

export const isRTL = currentLocale.indexOf('zh') === 0;

ReactNative.I18nManager.allowRTL(isRTL);

export function strings(name, params) {
  return I18n.t(name, params || {defaultValue: name});
}

export const setLocale = locale => {
  I18n.locale = locale;
};

export default I18n;
