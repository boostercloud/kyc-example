import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class BackgroundCheckPassed {
  public constructor(
    readonly profileId: UUID,
    readonly validatorId: UUID | 'auto',
    readonly timestamp: string,
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
