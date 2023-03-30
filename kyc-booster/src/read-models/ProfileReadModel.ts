import { Projects, ReadModel } from '@boostercloud/framework-core'
import { ProjectionResult, UUID } from '@boostercloud/framework-types'
import { Profile } from '../entities/profile'
import { KYCStatus } from '../common/types'

@ReadModel({
  authorize: 'all', // You can specify roles to restrict access to this read model
})
export class ProfileReadModel {
  public constructor(
    public id: UUID,
    readonly firstName: string,
    readonly lastName: string,
    readonly address: string,
    readonly city: string,
    readonly state: string,
    readonly zipCode: string,
    readonly dateOfBirth: string,
    readonly phoneNumber: string,
    readonly email: string,
    readonly kycStatus: KYCStatus,
    readonly ssn?: string,
    readonly tin?: string,
  ) {}

  @Projects(Profile, 'id')
  public static projectProfile(entity: Profile): ProjectionResult<ProfileReadModel> {
    return new ProfileReadModel(entity.id, entity.firstName, entity.lastName, entity.address, entity.city, entity.state, entity.zipCode, entity.dateOfBirth, entity.phoneNumber, entity.email, entity.kycStatus, entity.ssn, entity.tin)
  }
}
