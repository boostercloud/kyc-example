import { Booster } from '@boostercloud/framework-core'
import { config } from 'dotenv'
export {
  Booster,
  boosterEventDispatcher,
  boosterServeGraphQL,
  boosterNotifySubscribers,
  boosterTriggerScheduledCommand,
  boosterRocketDispatcher,
} from '@boostercloud/framework-core'

config()
Booster.start(__dirname)
