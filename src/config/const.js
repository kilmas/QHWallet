export const NETWORK_ENV_MAINNET = 1
export const NETWORK_ENV_TESTNET = 2

export const BASEURL_MAINNET_QHWALLET = 'https://gateway.qingah.com'

export const DEEPLINK_LINK_BLANK = 'DEEPLINK_LINK_BLANK'

export const MNEMONIC_TYPE_EN = 0
export const MNEMONIC_TYPE_ZH = 1

export const ACCOUNT_TYPE_HD = 1
export const ACCOUNT_TYPE_HD_IMPORT = 3
export const ACCOUNT_TYPE_MULTISIG = 5

export const ACCOUNT_TYPE_COMMON = 7

export const ACCOUNT_DEFAULT_ID_HD = 'ACCOUNT_DEFAULT_ID_HD'
export const ACCOUNT_DEFAULT_ID_MULTISIG = 'ACCOUNT_DEFAULT_ID_MULTISIG'

export const CURRENCY_TYPE_CNY = 'CNY'
export const CURRENCY_TYPE_USD = 'USD'

export const WALLET_TYPE_ETH = 1
export const WALLET_TYPE_BTC = 2
export const WALLET_TYPE_OMNI = 3
export const WALLET_TYPE_ETC = 4
export const WALLET_TYPE_BCH = 5
export const WALLET_TYPE_BSV = 6
export const WALLET_TYPE_FO = 8

export const TX_PAGE_SIZE = 50

export const ETHEREUM_CHAINID_MAINNET = 1
export const ETHEREUM_CHAINID_TESTNET = 3
export const ETHEREUM_CHAINID_ETC_MAINNET = 61

export const BTC_ADDRESS_TYPE_PKH = 1
export const BTC_ADDRESS_TYPE_SH = 2
export const BTC_ADDRESS_TYPE_KH = 3

export const BTC_INPUT_TYPE_P2PKH = 1
export const BTC_INPUT_TYPE_P2SH = 2
export const BTC_INPUT_TYPE_P2KH = 3

export const BTC_SIGHASH_ALL = 0x1
export const BTC_SIGHASH_NONE = 0x2
export const BTC_SIGHASH_SINGLE = 0x3
export const BTC_SIGHASH_FORKID = 0x40
export const BTC_SIGHASH_OUTPUT_MASK = 0x1f
export const BTC_SIGHASH_ANYONECANPAY = 0x80

export const COIN_ID_BTC = 0
export const COIN_ID_ETH = 60
export const COIN_ID_ETC = 61
export const COIN_ID_BCH = 145
export const COIN_ID_BSV = 236
export const COIN_ID_USDT = 200
export const COIN_ID_FO = 10000
export const COIN_ID_EOS = 194

export const COIN_ID_OKT = 996

export const COIN_TYPE_BTC = 0
export const COIN_TYPE_ETH = 60
export const COIN_TYPE_ETC = 61
export const COIN_TYPE_BCH = 145
export const COIN_TYPE_BSV = 236

export const COIN_TYPE_OKT = 996

export const COIN_TYPE_FO = 10000
export const COIN_TYPE_EOS = 194

export const COIN_TYPE_USDT = 200

export const HDACCOUNT_FIND_WALELT_TYPE_ID = 1 << 0
export const HDACCOUNT_FIND_WALELT_TYPE_ADDRESS = 1 << 1
export const HDACCOUNT_FIND_WALELT_TYPE_COINID = 1 << 2

export const WALLET_SOURCE_MW = 1 //
export const WALLET_SOURCE_PK = 2 //
export const WALLET_SOURCE_KS = 3 // KeyStore

export const APP_SCHEME = 'qhwallet://'

export const SCHEMA_BTC = 'bitcoin:'
export const SCHEMA_ETH = 'iban:'

export const SPLASH_SCENE_TAB = 1
export const SPLASH_SCENE_LOCK = 2
export const SPLASH_SCENE_GUIDE = 3

export const RPC_URL_CHANGE = 'RPC_URL_CHANGE'

// notification
export const NOTIFICATION_AUTH_FINISH = 'NOTIFICATION_AUTH_FINISH'
export const NOTIFICATION_SPLASH_FINISH = 'NOTIFICATION_SPLASH_FINISH'
export const NOTIFICATION_SPLASH_START = 'NOTIFICATION_SPLASH_START'
export const NOTIFICATION_WARNING_FINISH = 'NOTIFICATION_WARNING_FINISH'

// HUD
export const HUD_TYPE_LOADING = 'loading'
export const HUD_TYPE_TOAST = 'toast'
export const HUD_TYPE_ALERT = 'alert'

export const HUD_STATUS_SUCCESS = 'success'
export const HUD_STATUS_FAILED = 'failed'
export const HUD_STATUS_CUSTOM = 'custom'

// log module
export const LOGGER_MODULE_COMMON = 'common'
export const LOGGER_MODULE_LOG = 'log'
export const LOGGER_MODULE_CORE = 'core'
export const LOGGER_MODULE_NETWORK = 'network'
export const LOGGER_MODULE_WALLET = 'wallet'
export const LOGGER_MODULE_EXCHANGE = 'exchange'
export const LOGGER_MODULE_MARKET = 'market'

// lock
export const LOCKSCREEN_DISPLAY_STYLE_MODAL = 'modal'
export const LOCKSCREEN_DISPLAY_STYLE_SINGLE = 'single'

export const WALLET_TAB_JUMP_NOTIFICATION = 'WALLET_TAB_JUMP_NOTIFICATION'
export const WALLET_TAB_JUMP_NOTIFICATION_INDEX_MULTISIG = 'WALLET_TAB_JUMP_NOTIFICATION_INDEX_MULTISIG'
export const WALLET_TAB_JUMP_NOTIFICATION_INDEX_HD = 'WALLET_TAB_JUMP_NOTIFICATION_INDEX_HD'

export const HDACCOUNT_FPPAYMENT_ERROR_MAX_FAILED = 'HDACCOUNT_FINGERPRINTPAYMENT_ERROR_MAX_FAILED'
export const HDACCOUNT_FPPAYMENT_ERROR_FALLBACK = 'HDACCOUNT_FINGERPRINTPAYMENT_ERROR_FALLBACK'
export const HDACCOUNT_FPPAYMENT_ERROR_CANCEL = 'HDACCOUNT_FPPAYMENT_ERROR_CANCEL'

export const I18N_LANGUAGE_CHANGE_NOTIFICATION = 'I18N_LANGUAGE_CHANGE_NOTIFICATION'

export const TAB_SWITCH = 'TAB_SWITCH'

export const crossFoContractAddress =
  process.env.NODE_ENV !== 'production' ? '0x8cbd6dFDD2Cc917793746613A648c600AFB020b1' : '0x4152e64d1d3944dd0f6d0893cbac90d0dda807f3'

export const foChainID = '68cee14f598d88d340b50940b6ddfba28c444b46cd5f33201ace82c78896793a'

export const foNetwork = 'http://testnet.fo/'

export const BITCOIN_SATOSHI = 100000000
