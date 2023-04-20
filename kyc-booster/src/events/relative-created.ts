import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class RelativeCreated {
  public constructor(
    readonly relativeId: UUID,
    readonly firstName: string,
    readonly lastName: string,
    readonly relationship: string,
    readonly politicalInfluence: boolean,
    readonly profileId: UUID,
  ) {}

  public entityID(): UUID {
    return this.relativeId
  }
}
