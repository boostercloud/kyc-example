import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class IDVerificationSuccess {
  public constructor(
    readonly profileId: UUID,
    readonly verificationId: UUID,
    readonly timestamp: string,
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
