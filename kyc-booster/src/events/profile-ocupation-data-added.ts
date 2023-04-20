import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'
import { IncomeSource } from '../common/types'

@Event
export class ProfileOcupationDataAdded {
  public constructor(
    readonly profileId: UUID,
    readonly occupation: string,
    readonly employer: string,
    readonly sourceOfIncome: IncomeSource,
  ) {}

  public entityID(): UUID {
    return this.profileId
  }
}
