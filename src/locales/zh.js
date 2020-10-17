export default {
  // Common use
  name: 'QHWallet 钱包',
  introduce: '一句话介绍钱包',
  next: '下一步',
  confirm: '确认',
  import: '导入',
  save: '保存',
  submit: '提交',
  help: '帮助',
  oK: '确定',
  balance: '余额',

  date: {
    months: {
      '0': '一月',
      '1': '二月',
      '2': '三月',
      '3': '四月',
      '4': '五月',
      '5': '六月',
      '6': '七月',
      '7': '八月',
      '8': '九月',
      '9': '十月',
      '10': '十一月',
      '11': '十二月',
    },
    connector: 'at',
  },

  tab: {
    Wallet: '钱包',
    Defi: 'Defi',
    Dapp: 'Dapp',
  },

  drawer: {
    wallet: '钱包',
    messages: '反馈',
    settings: '设置',
  },

  welcome: {
    step1: '代码开源，全程社区代码，通用的安全.',
    step2: '极致的去中心化',
    step3: '简约有趣，发现无处在的价值。',
  },

  // wallet
  wallet: {
    skip: '跳过备份',
    dapp: 'Dapp',
    Defi: 'Defi',
    management: '钱包管理',
    settings: '钱包设定',
    create: '创建钱包',
    import: '导入钱包',
    policy: '《服务及隐私条款》',
    readPolicy: '我已阅读并同意《服务及隐私条款》',
    nameWallet: '命名您的钱包',
    setTransactionPassword: '请设置交易密码',
    notes:
      '注意：\n\nQHWallet不会保存如何用户的密码或者提供找回和重置密码的方式。如果您忘记了交易密码，您只可以通过备份的助记词导入钱包，然后重新设置一个新的交易密码。',
    confirmTransactionPassword: '请确认交易密码',
    createSuccess: '成功创建钱包',
    notesSuccess: '请妥善保存好您的助记词，并存放在安全的地方。请不要截图！任何人获取到您的助记词，想当于可以完全控制您的钱包资产。',
    backupNow: '立刻备份',
    backupLater: '稍后备份',
    writeDownPhrase: '请记下您的助记词并保存在安全的地方',
    notesBackup:
      '注意： \n钱包助记词用于恢复您的钱包资产。QHWallet不会保存任何用户的助记词，也不提供任何方式找回它们。所以请记下您的钱包助记词并不要与他人分享',
    exportNote: '上面是BTC地址和私钥对。 点击即可复制它们。',
    exportWarning: '注意：请不要共享私钥。\n无论谁知道私钥都可以完全控制地址的资产。',
    deleteNote: '注意：\n删除钱包之前，请确保已备份了钱包的助记词或私钥，并将其保存在安全的地方。',
    verifyPhrase: '验证您的钱包助记词',
    newPassWordNote: '设置新的交易密码',
    CheckNewPassWordNote: '确认新的交易密码',
    setNewPasswordSuccess: '更改交易密码成功！',
    notesVerify: '请根据您记下的助记词，按顺序点击，以验证您记下的助记词是正确的',
    backupSuccess: '验证助记词正确无误',
    enterWallet: '进入钱包',
    wallet: '钱包',
    totalAssets: '总资产',
    myAssets: '我的资产',
    stake: '存款',
    stakeAddress: '存入地址',
    currentPhase: '当前阶段：',
    contractPhase: '合约阶段：',
    time: '时间',
    yesterday: '昨日',
    interest: '利息',
    available: '可用',
    receive: '转入',
    send: '转出',
    to: '发送至',
    all: '全部',
    staking: '已存款',
    amount: '金额',
    fee: '矿工费',
    slow: '慢',
    normal: '普通',
    quick: '快',
    transact: '交易',
    status: '状态:',
    sendConfirm: '发送确认',
    toAddress: '接收地址',
    selectCoin: '选择代币',
    walletAddress: '钱包地址',
    copyAddress: '复制地址',
    copyPrivatekey: '复制地址与私钥',
    shareAddress: '分享地址',
    walletManagement: '钱包管理',
    addWallet: '添加钱包',
    addWalletMethod: '请选择添加新钱包的方法',
    currentWallet: '当前钱包',
    otherWallets: '其他钱包',
    walletSetting: '钱包设置',
    changeWalletName: '更改钱包名称',
    changePassword: '更改交易密码',
    changePasswordText: '输入当前交易密码',
    exportPrivateKeys: '导出私钥',
    exportPrivateKeysText: '输入交易密码',
    backupWallet: '备份钱包',
    deleteWallet: '删除钱包',
    deleteSuccess: '删除成功',
    selectMethod: '选择导入钱包的方法',
    phrases: '助记词',
    privateKey: '私钥',
    notesInput: '请导入您的助记词（12个单词），并使用空格分开每一个单词',
    inputSuccess: '导入助记词成功',
    transactFee: '交易费:',
    inputKey: '请导入您的私钥',
    inputKeySuccess: '导入私钥成功',
    verifyFail: '验证失败',
    withdraw: '提现',
    importFailTip: '导入失败,请重新尝试',
    tools: '工具',

    title: 'Wallet',
    tokens: 'TOKENS',
    collectible: 'Collectible',
    collectibles: 'COLLECTIBLES',
    transactions: 'TRANSACTIONS',
    no_collectibles: "You don't have any collectibles!",
    add_tokens: 'ADD TOKENS',
    no_tokens: "You don't have any tokens!",
    add_collectibles: 'ADD COLLECTIBLES',
    no_transactions: 'You have no transactions!',
    send_button: 'Send',
    deposit_button: 'Deposit',
    copy_address: 'Copy',
    remove_token_title: 'Do you want to remove this token?',
    remove_collectible_title: 'Do you want to remove this collectible?',
    token_removed_title: 'Token removed!',
    token_removed_desc: 'If you change your mind, you can add it back by tapping on "+ ADD TOKENS"',
    collectible_removed_title: 'Collectible removed!',
    collectible_removed_desc: 'If you change your mind, you can add it back by tapping on "+ ADD COLLECTIBLES"',
    remove: 'Remove',
    cancel: 'Cancel',
    yes: 'Yes',
    private_key_detected: 'Private key detected',
    do_you_want_to_import_this_account: 'Do you want to import this account?',
    error: 'Error',
    logout_to_import_seed: 'You need to log out first in order to import a seed phrase.',
  },

  settings: {
    settings: '显示设置',
    profile: '个人档案',
    contacts: '地址簿',
    nodeSwitch: '节点选择',
    help: '帮助与反馈',
    aboutUs: '关于我们',
    language: '语言',
    currency: '货币单位',
    notification: '消息',
    name: '姓名',
    address: '地址',
    addContacts: '新增地址',
    feedback: '反馈',
    problemType: '问题类型',
    date: '日期',
    description: '问题描述',
    contactYou: '输入您希望我们联系您的通讯方式？',
    phone: '手机号码',
    email: '邮箱',
    ss: '服务及隐私条款',
    security: '安全',
    aboutDesc: 'Qingah钱包是一款去中心化应用 (DApp) 可以在手机和Web浏览器上使用。',
    newVersion: '有新版本更新',
    noVersion: '现版本最新',
  },
  authentication: {
    auth_prompt_title: '请求授权',
    auth_prompt_desc: '请授权验证使用钱包',
    fingerprint_prompt_title: '请求授权',
    fingerprint_prompt_desc: '使用你的指纹/FaceID解锁钱包',
    fingerprint_prompt_cancel: '取消',
  },
  autocomplete: {
    placeholder: 'Search or Type URL',
  },
  action_view: {
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  transaction: {
    alert: 'ALERT',
    amount: 'Amount',
    next: 'Next',
    back: 'Back',
    confirm: 'Confirm',
    reject: 'Reject',
    edit: 'Edit',
    cancel: 'Cancel',
    speedup: 'Speed up',
    from: 'From',
    gas_fee: 'Network fee',
    gas_fee_fast: 'FAST',
    gas_fee_average: 'AVERAGE',
    gas_fee_slow: 'SLOW',
    hex_data: 'Hex Data',
    review_details: 'DETAILS',
    review_data: 'DATA',
    review_function_type: 'FUNCTION TYPE',
    review_hex_data: 'HEX DATA',
    insufficient: 'Insufficient funds',
    insufficient_tokens: 'Insufficient {{token}}',
    invalid_address: 'Invalid address',
    invalid_amount: 'Invalid amount',
    invalid_gas: 'Invalid gas amount',
    invalid_gas_price: 'Invalid gas price',
    invalid_collectible_ownership: "You don't own this collectible",
    known_asset_contract: 'Known asset contract address',
    max: 'Max',
    recipient_address: 'Recipient Address',
    required: 'Required',
    to: 'To',
    total: 'Total',
    loading: 'Loading...',
    conversion_not_available: 'Conversion rate not available',
    value_not_available: 'Not Available',
    rate_not_available: 'Conversion not available',
    optional: 'Optional',
    no_address_for_ens: 'No address for ENS name',
    lets_try: "Yes, let's try",
    approve_warning: 'By approving this action, you grant permission for this contract to spend up to',
    cancel_tx_title: 'Attempt to cancel?',
    cancel_tx_message:
      'Submitting this attempt does not guarantee your original transaction will be cancelled. If the cancellation attempt is successful, you will be charged the transaction fee above.',
    speedup_tx_title: 'Attempt to speed up?',
    speedup_tx_message:
      'Submitting this attempt does not guarantee your original transaction will be accelerated. If the speed up attempt is successful, you will be charged the transaction fee above.',
    nevermind: 'Nevermind',
    edit_network_fee: 'Edit Network Fee',
    gas_cancel_fee: 'Gas Cancellation Fee',
    gas_speedup_fee: 'Gas Speed Up fee',
    use_max: 'Use max',
    set_gas: 'Set',
    cancel_gas: 'Cancel',
    transaction_fee: 'Transaction fee',
    transaction_fee_less: 'No fee',
    total_amount: 'Total amount',
    adjust_transaction_fee: 'Adjust transaction fee',
    could_not_resolve_ens: "Couldn't resolve ENS",
    asset: 'Asset',
    balance: 'Balance',
    not_enough_for_gas: 'You have 0 ETH in your account to pay for transaction fees. Buy some ETH or deposit from another account.',
  },
  custom_gas: {
    advanced_options: 'Advanced',
    basic_options: 'Basic',
    hide_advanced_options: 'Hide advanced',
    gas_limit: 'Gas Limit:',
    gas_price: 'Gas Price: (GWEI)',
    save: 'Save',
    warning_gas_limit: 'Gas limit must be greater than 20999 and less than 7920027',
    cost_explanation: 'Select the network fee you are willing to pay. The higher the fee, the better chances and faster your transaction will go through.',
  },
  browser: {
    title: '浏览器',
    reload: '刷新',
    share: '分享',
    bookmark: '地址簿',
    add_to_favorites: '添加收藏',
    error: 'Ooops!',
    cancel: '取消',
    go_back: '返回',
    go_forward: '向前',
    home: '主页',
    close: '关闭',
    open_in_browser: '打开浏览器',
    change_url: '更改url地址',
    switch_network: '切换网络',
    dapp_browser: 'DAPP 浏览器',
    dapp_browser_message: 'MetaMask is your wallet and browser for the decentralized web. Have a look around!',
    featured_dapps: 'FEATURED DAPPS',
    my_favorites: '我的收藏',
    search: 'Search or type a URL',
    welcome: '欢迎!',
    remove: '移除',
    new_tab: 'New tab',
    tabs_close_all: '关闭全部',
    tabs_done: 'Done',
    no_tabs_title: 'No Open Tabs',
    no_tabs_desc: 'To browse the decentralized web, add a new tab',
    failed_to_resolve_ens_name: "We couldn't resolve that ENS name",
    remove_bookmark_title: '删除收藏',
    remove_bookmark_msg: 'Do you really want to remove this site from your favorites?',
    yes: 'Yes',
    backup_alert_title: 'Protect your funds',
    backup_alert_message: 'Tap to save your seed phrase',
  },
  approval: {
    title: 'Confirm Transaction',
  },
  approve: {
    title: 'Approve',
  },
  transactions: {
    tx_review_confirm: 'CONFIRM',
    tx_review_transfer: 'TRANSFER',
    tx_review_contract_deployment: 'CONTRACT DEPLOYMENT',
    tx_review_transfer_from: 'TRANSFER FROM',
    tx_review_unknown: 'UNKNOWN METHOD',
    tx_review_approve: 'APPROVE',
    tx_review_instant_payment_deposit: 'INSTANT PAYMENT DEPOSIT',
    sent_ether: 'Sent Ether',
    self_sent_ether: 'Sent Yourself Ether',
    received_ether: 'Received Ether',
    sent_dai: 'Sent DAI',
    self_sent_dai: 'Sent Yourself DAI',
    received_dai: 'Received DAI',
    sent_tokens: 'Sent Tokens',
    ether: 'Ether',
    sent_unit: 'Sent {{unit}}',
    self_sent_unit: 'Sent Yourself {{unit}}',
    received_unit: 'Received {{unit}}',
    sent_collectible: 'Sent Collectible',
    sent: 'Sent',
    contract_deploy: 'Contract Deployment',
    to_contract: 'New Contract',
    instant_payment_deposit: 'Instant Payment Deposit',
    instant_payment_deposit_tx: 'Deposit',
    instant_payment_withdraw_tx: 'Withdraw',
    tx_details_free: 'Free',
    tx_details_not_available: 'Not available',
    smart_contract_interaction: 'Smart Contract Interaction',
    approve: 'Approve',
    hash: 'Hash',
    from: 'From',
    to: 'To',
    details: 'Details',
    amount: 'Amount',
    gas_limit: 'Gas Limit (Units)',
    gas_price: 'Gas Price (GWEI)',
    total: 'Total',
    view_on: 'VIEW ON',
    view_on_etherscan: 'View on Etherscan',
    hash_copied_to_clipboard: 'Transaction hash copied to clipboard',
    address_copied_to_clipboard: 'Address copied to clipboard',
    transaction_error: 'Transaction error',
    address_to_placeholder: 'Search, public address (0x), or ENS',
    address_from_balance: 'Balance:',
    status: 'Status',
    date: 'Date',
    nonce: 'Nonce',
  },
  accountApproval: {
    title: 'CONNECT REQUEST',
    walletconnect_title: 'WALLETCONNECT REQUEST',
    action: 'Connect to this site?',
    connect: 'Connect',
    cancel: 'Cancel',
    permission: 'View your',
    address: 'public address',
    sign_messages: 'Sign messages',
    on_your_behalf: 'on your behalf',
    warning:
      'By clicking connect, you allow this dapp to view your public address. This is an important security step to protect your data from potential phishing risks.',
  },
  signature_request: {
    title: 'Signature Request',
    cancel: 'Cancel',
    sign: 'Sign',
    sign_requested: 'Your signature is being requested',
    signing: 'Sign this message?',
    account_title: 'Account:',
    balance_title: 'Balance:',
    message: 'Message',
    message_from: 'Message from',
    learn_more: 'Learn More',
    read_more: 'Read more',
    eth_sign_warning: 'Proceed with caution. This action can potentially be used to withdraw assets from your account. Make sure you trust this site.',
  },
  unit: {
    eth: 'ETH',
    sai: 'SAI',
    dai: 'DAI',
    negative: '-',
    divisor: '/',
    token_id: '#',
    colon: ':',
    point: '.',
    week: 'week',
    day: 'day',
    hour: 'hr',
    minute: 'min',
    second: 'sec',
    empty_data: '0x',
  },
  biometrics: {
    enable_touchid: 'Sign In with Touch ID?',
    enable_faceid: 'Sign In with Face ID?',
    enable_fingerprint: 'Sign In with Fingerprint?',
    enable_device_passcode_ios: 'Sign in with device passcode?',
    enable_device_passcode_android: 'Sign in with device PIN?',
  },
  token: {
    token_symbol: 'Token Symbol',
    token_address: 'Token Address',
    token_precision: 'Token of Precision',
    search_tokens_placeholder: 'Search Tokens',
    address_cant_be_empty: "Token address can't be empty.",
    address_must_be_valid: 'Token address must be a valid address.',
    symbol_cant_be_empty: "Token symbol can't be empty.",
    decimals_cant_be_empty: "Token decimals can't be empty.",
    no_tokens_found: "We couldn't find any tokens with that name.",
    select_token: 'Select Token',
    address_must_be_smart_contract: 'Personal address detected. Enter the token contract address.',
  },
  collectible: {
    collectible_address: 'Address',
    collectible_type: 'Type',
    collectible_token_id: 'ID',
    collectible_description: 'Description',
    address_must_be_valid: 'Collectible address must be a valid address.',
    address_must_be_smart_contract: 'Personal address detected. Input the collectible contract address.',
    address_cant_be_empty: "Collectible address can't be empty.",
    token_id_cant_be_empty: "Collectible identifier can't be empty.",
    ownership_error_title: 'Ooops! Something happened.',
    ownership_error: "You are not the owner of this collectible, so you can't add it.",
    powered_by_opensea: 'Powered by',
    id_placeholder: 'Enter the collectible ID',
  },
  add_asset: {
    title: 'Add Asset',
    search_token: 'SEARCH',
    custom_token: 'CUSTOM TOKEN',
    tokens: {
      cancel_add_token: 'CANCEL',
      add_token: 'ADD TOKEN',
    },
    collectibles: {
      cancel_add_collectible: 'CANCEL',
      add_collectible: 'ADD',
    },
  },
  asset_overview: {
    send_button: 'Send',
    receive_button: 'RECEIVE',
    add_collectible_button: 'Add',
    info: 'Info',
    description: 'Description',
    totalSupply: 'Total Supply',
    address: 'Address',
  },
  address_book: {
    recents: 'Recents',
    save: 'Save',
    delete_contact: 'Delete contact',
    delete: 'Delete',
    cancel: 'Cancel',
    add_to_address_book: 'Add to address book',
    enter_an_alias: 'Enter an alias',
    add_this_address: 'Add this address to your address book',
    next: 'Next',
    enter_an_alias_placeholder: 'e.g. Vitalik B.',
    add_contact_title: 'Add Contact',
    add_contact: 'Add contact',
    edit_contact_title: 'Edit Contact',
    edit_contact: 'Edit contact',
    edit: 'Edit',
    address_already_saved: 'Contact already saved',
    address: 'Address',
    name: 'Name',
    nickname: 'Name',
    add_input_placeholder: 'Public address (0x), or ENS',
    between_account: 'Transfer between my accounts',
    others: 'Others',
    memo: 'Memo',
  },
  transaction_submitted: {
    title: 'Transaction Submitted',
    your_tx_hash_is: 'Your transaction hash is:',
    view_on_etherscan: 'View on Etherscan',
  },
  receive_request: {
    title: 'Receive',
    share_title: 'Share Address',
    share_description: 'Email or text your address',
    qr_code_title: 'QR Code',
    qr_code_description: 'Scannable image that can read your address',
    request_title: 'Request',
    request_description: 'Request assets from friends',
    buy_title: 'Buy',
    buy_description: 'Buy Crypto with Credit Card',
    public_address: 'Public Address',
    public_address_qr_code: 'Public Address',
    coming_soon: 'Coming soon...',
  },
  account_details: {
    title: 'Account Details',
    share_account: 'Share',
    view_account: 'View account on Etherscan',
    show_private_key: 'Show private key',
    account_copied_to_clipboard: 'Public address copied to clipboard',
    share_public_key: 'Sharing my public key: ',
  },
  networks: {
    title: 'Networks',
    other_networks: 'Other Networks',
    close: 'Close',
    status_ok: 'All Systems Operational',
    status_not_ok: 'The network is having some issues',
  },
  webview_error: {
    title: 'Ooops! something went wrong...',
    message: "We weren't able to load that page.",
    reason: 'Reason',
    try_again: 'Try again',
  },
  add_favorite: {
    title: 'Add Favorite',
    title_label: 'Name',
    url_label: 'Url',
    add_button: 'Add',
    cancel_button: 'Cancel',
  },
  qr_scanner: {
    invalid_qr_code_title: 'Invalid QR Code',
    invalid_qr_code_message: 'The QR code that you are trying to scan it is not valid.',
    allow_camera_dialog_title: 'Allow camera access',
    allow_camera_dialog_message: 'We need your permission to scan QR codes',
    scanning: 'scanning...',
    ok: 'Ok',
    cancel: 'Cancel',
    error: 'Error',
    attempting_sync_from_wallet_error:
      "Looks like you're trying to sync with the extension. In order to do that, Please go to Settings > Advanced > Sync with MetaMask Extension",
  },
  receive: {
    newAddress: 'Request new address',
    myAddress: 'My addresses',
    formatList: 'Address format',
    signMessage: 'Sign message',
    showPrivateKey: 'Show Private Key',
    autoGenAddress: 'Auto generate address',
  },
  spend_limit_edition: {
    save: 'Save',
    title: 'Edit permission',
    spend_limit: 'Spend limit permission',
    allow: 'Allow',
    allow_explanation: 'to withdraw and spend up to the following amount:',
    proposed: 'Proposed approval limit',
    requested_by: 'Spend limit requested by',
    custom_spend_limit: 'Custom spend limit',
    max_spend_limit: 'Enter a max spend limit',
    minimum: '1.00 {{tokenSymbol}} minimum',
    cancel: 'Cancel',
    approve: 'Approve',
    you_trust_this_site_1: '',
    you_trust_this_site_2: '{{tokenSymbol}}',
    allow_to_access: 'Give this site permission to access your {{tokenSymbol}}?',
    allow_to_address_access: 'Give this address access your {{tokenSymbol}}?',
    you_trust_this_site: "Do you trust this site? By granting this permission, you're allowing this site to access your funds.",
    you_trust_this_address: "Do you trust this address? By granting this permission, you're allowing this address to access your funds.",
    edit_permission: 'Edit permission',
    edit: 'Edit',
    transaction_fee_explanation: 'A transaction fee is associated with this permission.',
    view_details: 'View details',
    view_data: 'View Data',
    transaction_details: 'Transaction Details',
    site_url: 'Site URL',
    permission_request: 'Permission request',
    details_explanation: '{{host}} may access and spend up to this max amount from this account.',
    amount: 'Amount:',
    allowance: 'Allowance:',
    to: 'To:',
    contract: 'Contract ({{address}})',
    contract_name: 'Contract name:',
    contract_address: 'Contract address:',
    contract_allowance: 'Allowance:',
    data: 'Data',
    function_approve: 'Function: Approve',
    function: 'Function',
    close: 'Close',
    all_set: 'All set!',
    all_set_desc: 'You’ve successfully set permissions for this site.',
    unlimited: 'unlimited',
  },
}
