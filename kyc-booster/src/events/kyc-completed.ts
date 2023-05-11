import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class KYCCompleted {
  public constructor(
    readonly profileId: UUID,
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
