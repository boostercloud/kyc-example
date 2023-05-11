import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class PromoCodeCreated {
  public constructor(
    readonly promoCodeId: UUID,
    readonly profileId: UUID,
  ) {}

  public entityID(): UUID {
    return this.promoCodeId
  }
}
