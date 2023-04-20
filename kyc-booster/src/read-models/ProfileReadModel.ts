import { Projects, ReadModel } from '@boostercloud/framework-core'
import { ProjectionResult, ReadModelAction, UUID } from '@boostercloud/framework-types'
import { Profile } from '../entities/profile'
import { Relative } from '../entities/relative'
import { IncomeSource, KYCStatus } from '../common/types'

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
    readonly country: string,
    readonly dateOfBirth: string,
    readonly phoneNumber: string,
    readonly nationality: string,
    readonly email: string,
    readonly kycStatus: KYCStatus,
    readonly ssn?: string,
    readonly tin?: string,
    readonly idVerificationId?: UUID,
    readonly idVerifiedAt?: string,
    readonly idRejectedAt?: string,
    readonly addressVerificationId?: UUID,
    readonly addressVerifiedAt?: string,
    readonly addressRejectedAt?: string,
    readonly backgroundCheckPassedAt?: string,
    readonly backgroundCheckTriedAt?: string,
    readonly backgroundCheckValidatorId?: UUID | 'auto',
    readonly backgroundCheckRejectedAt?: string,
    readonly occupation?: string,
    readonly employer?: string,
    readonly sourceOfIncome?: IncomeSource,
    readonly relatives: Relative[] = []
  ) {}

  @Projects(Profile, 'id')
  public static projectProfile(entity: Profile, currentProfileReadModel?: ProfileReadModel): ProjectionResult<ProfileReadModel> {
    if (currentProfileReadModel) {
      return ProfileReadModel.build(currentProfileReadModel, { ...entity })
    } else {
      return ProfileReadModel.build({ ...entity, relatives: [] })
    }
  }

  @Projects(Relative, 'profileId')
  public static projectRelative(entity: Relative, currentProfileReadModel?: ProfileReadModel): ProjectionResult<ProfileReadModel> {
    if (currentProfileReadModel) {
      return ProfileReadModel.build(currentProfileReadModel, { relatives: [...currentProfileReadModel.relatives, entity] })
    } else {
      return ReadModelAction.Nothing
    }
  }

  private static build(currentProfileReadModel: ProfileReadModel, fields?: Partial<ProfileReadModel>): ProfileReadModel {
    return new ProfileReadModel(
      fields?.id ?? currentProfileReadModel.id,
      fields?.firstName ?? currentProfileReadModel.firstName,
      fields?.lastName ?? currentProfileReadModel.lastName,
      fields?.address ?? currentProfileReadModel.address,
      fields?.city ?? currentProfileReadModel.city,
      fields?.state ?? currentProfileReadModel.state,
      fields?.zipCode ?? currentProfileReadModel.zipCode,
      fields?.country ?? currentProfileReadModel.country,
      fields?.dateOfBirth ?? currentProfileReadModel.dateOfBirth,
      fields?.phoneNumber ?? currentProfileReadModel.phoneNumber,
      fields?.nationality ?? currentProfileReadModel.nationality,
      fields?.email ?? currentProfileReadModel.email,
      fields?.kycStatus ?? currentProfileReadModel.kycStatus,
      fields?.ssn ?? currentProfileReadModel.ssn,
      fields?.tin ?? currentProfileReadModel.tin,
      fields?.idVerificationId ?? currentProfileReadModel.idVerificationId,
      fields?.idVerifiedAt ?? currentProfileReadModel.idVerifiedAt,
      fields?.idRejectedAt ?? currentProfileReadModel.idRejectedAt,
      fields?.addressVerificationId ?? currentProfileReadModel.addressVerificationId,
      fields?.addressVerifiedAt ?? currentProfileReadModel.addressVerifiedAt,
      fields?.addressRejectedAt ?? currentProfileReadModel.addressRejectedAt,
      fields?.backgroundCheckPassedAt ?? currentProfileReadModel.backgroundCheckPassedAt,
      fields?.backgroundCheckTriedAt ?? currentProfileReadModel.backgroundCheckTriedAt,
      fields?.backgroundCheckValidatorId ?? currentProfileReadModel.backgroundCheckValidatorId,
      fields?.backgroundCheckRejectedAt ?? currentProfileReadModel.backgroundCheckRejectedAt,
      fields?.occupation ?? currentProfileReadModel.occupation,
      fields?.employer ?? currentProfileReadModel.employer,
      fields?.sourceOfIncome ?? currentProfileReadModel.sourceOfIncome,
      fields?.relatives ?? currentProfileReadModel.relatives
    )
  }
}
