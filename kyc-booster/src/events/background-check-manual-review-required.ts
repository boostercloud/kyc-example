import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class BackgroundCheckManualReviewRequired {
  public constructor(
    readonly profileId: UUID,
    readonly timestamp: string,
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
