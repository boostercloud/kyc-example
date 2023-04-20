import { Entity, Reduces } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'
import { RelativeCreated } from '../events/relative-created'

@Entity
export class Relative {
  public constructor(
    public id: UUID,
    readonly firstName: string,
    readonly lastName: string,
    readonly relationship: string,
    readonly politicalInfluence: boolean,
    readonly profileId: UUID,
  ) {}

  @Reduces(RelativeCreated)
  public static reduceRelativeCreated(event: RelativeCreated, currentRelative?: Relative): Relative {
    return new Relative(event.relativeId, event.firstName, event.lastName, event.relationship, event.politicalInfluence, event.profileId)
  }
}
