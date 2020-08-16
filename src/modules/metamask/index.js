import Engine from './core/Engine'
class MetaMask {
  static engineInitialized = false

  static initalizeEngine = (engineStore) => {
    Engine.init(engineStore.backgroundState)

    Engine.datamodel &&
      Engine.datamodel.subscribe(() => {
        if (!this.engineInitialized) {
          this.engineInitialized = true
        }
      })

    Engine.context.AccountTrackerController.subscribe(() => {
      //   console.log({ type: 'UPDATE_BG_STATE', key: 'AccountTrackerController' })
      engineStore.updateBGstate('AccountTrackerController');
    })

    Engine.context.AddressBookController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'AddressBookController' })
      engineStore.updateBGstate('AddressBookController');
    })

    Engine.context.AssetsContractController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'AssetsContractController' })
      engineStore.updateBGstate('AssetsContractController');
    })

    Engine.context.AssetsController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'AssetsController' })
      engineStore.updateBGstate('AssetsController')
    })

    Engine.context.AssetsDetectionController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'AssetsDetectionController'})
      engineStore.updateBGstate('AssetsDetectionController')
    })

    Engine.context.CurrencyRateController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'CurrencyRateController' })
      engineStore.updateBGstate('CurrencyRateController')
    })

    Engine.context.KeyringController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'KeyringController' })
      engineStore.updateBGstate('KeyringController')
    })

    Engine.context.PersonalMessageManager.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'AccountTrackerController' })
      engineStore.updateBGstate('AccountTrackerController')
    })

    Engine.context.NetworkController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'NetworkController' })
      engineStore.updateBGstate('NetworkController')
    })

    Engine.context.NetworkStatusController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'NetworkStatusController' })
      engineStore.updateBGstate('NetworkStatusController')
    })

    Engine.context.PhishingController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'PhishingController' })
      engineStore.updateBGstate('PhishingController')
    })

    Engine.context.PreferencesController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'PreferencesController' })
      engineStore.updateBGstate('PreferencesController')
    })

    Engine.context.TokenBalancesController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'TokenBalancesController' })
      engineStore.updateBGstate('TokenBalancesController')
    })

    Engine.context.TokenRatesController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'TokenRatesController' })
      engineStore.updateBGstate('TokenRatesController')
    })

    Engine.context.TransactionController.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'TransactionController' })
      engineStore.updateBGstate('TransactionController')
    })

    Engine.context.TypedMessageManager.subscribe(() => {
      // console.log({ type: 'UPDATE_BG_STATE', key: 'TypedMessageManager' })
      engineStore.updateBGstate('TypedMessageManager')
    })
  }
}

export default MetaMask;
