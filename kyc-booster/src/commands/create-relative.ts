import { Command } from '@boostercloud/framework-core'
import { Register, UUID } from '@boostercloud/framework-types'
import { RelativeCreated } from '../events/relative-created'

@Command({
  authorize: 'all',
})
export class CreateRelative {
  public constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly relationship: string,
    readonly politicalInfluence: boolean,
    readonly profileId: UUID,
  ) {}

  public static async handle(command: CreateRelative , register: Register): Promise<{ id: UUID }> {
    const relativeId = UUID.generate()
    register.events(new RelativeCreated(
      relativeId,
      command.firstName,
      command.lastName,
      command.relationship,
      command.politicalInfluence,
      command.profileId,
    ))
    return { id: relativeId }
  }
}
