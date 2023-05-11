import { Entity, Reduces } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'
import { PromoCodeCreated } from '../events/promo-code-created'

@Entity
export class PromoCode {
  public constructor(
    public id: UUID,
    readonly profileId: UUID,
  ) {}

  @Reduces(PromoCodeCreated)
  public static reducePromoCodeCreated(event: PromoCodeCreated, currentPromoCode?: PromoCode): PromoCode {
    return new PromoCode(event.promoCodeId, event.profileId)
  }

}
