import { StyleSheet, Platform } from 'react-native'

export const BDCoLor = '#00838f'
export const LGColor = ['#00838f', '#b2ebf2']
export const LGColorBtn = ['#008394', '#00838f']
export const MainColor = ['#00838f', '#b2ebf2']
export const SecondaryColor = '#0F133C'
export const BGGray = '#F7F8F9'
export const colors = {
  placeholderTextColor: '#C4CAD2',
}

export const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e4e4e4',
  },
  btnPrimary: {
    width: 300,
    height: 60,
    backgroundColor: '#4b65aa',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
  },
  btnSecondary: {
    width: 320,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#007CFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 20,
    fontWeight: '500',
    color: SecondaryColor,
  },
  assetMainText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#FFF',
  },
  assetSubText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
  settingCell: {
    justifyContent: 'space-between',
    backgroundColor: '#F7F8F9',
    alignItems: 'center',
    borderRadius: 5,
  },
  settingCellText: {
    fontSize: 19,
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: '#4A4A4A',
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#BFBFBF',
  },
  textContent: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  scrollContent: {
    paddingBottom: 50,
  },

  pt26: {
    padding: 26,
  },
  p8: {
    padding: 8,
  },

  shadow:
    Platform.OS === 'ios'
      ? {
          shadowOffset: { width: 2, height: 10 },
          shadowColor: 'rgb(194, 193, 199)',
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 5,
        }
      : null,
})
