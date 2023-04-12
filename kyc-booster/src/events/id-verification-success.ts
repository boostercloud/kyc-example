import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class IDVerificationSuccess {
  public constructor(
    readonly userId: UUID,
    readonly verificationId: UUID,
    readonly timestamp: string,
  ) {}

  public entityID(): UUID {
    return this.userId
  }
}
