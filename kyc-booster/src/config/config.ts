import { Booster } from '@boostercloud/framework-core'
import { BoosterConfig } from '@boostercloud/framework-types'

Booster.configure('local', (config: BoosterConfig): void => {
  config.appName = 'kyc-booster'
  config.providerPackage = '@boostercloud/framework-provider-local'
})

Booster.configure('production', (config: BoosterConfig): void => {
  config.appName = 'kyc-booster'
  config.providerPackage = '@boostercloud/framework-provider-aws'
})
