import { Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { ProfileOcupationDataAdded } from '../events/profile-ocupation-data-added'
import { IncomeSource } from '../common/types'

@Command({
  authorize: 'all',
})
export class AddProfileOccupationData {
  public constructor(
    readonly profileId: UUID,
    readonly occupation: string,
    readonly employer: string,
    readonly sourceOfIncome: IncomeSource,
  ) {}

  public static async handle(command: AddProfileOccupationData , register: Register): Promise<void> {
    register.events(new ProfileOcupationDataAdded(
      command.profileId,
      command.occupation,
      command.employer,
      command.sourceOfIncome,
    ))
  }
}
