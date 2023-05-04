# Comparing complexity in MVC+CRUD vs. CQRS+ES

## Introduction

In software development projects, requirements are often described as user stories, which explain user intents and expectations (As `<someone>`, I want `<something>` because `<reason>`). Still, most backend systems nowadays are designed after the [Model-View-Controller (MVC)](https://en.wikipedia.org/wiki/Model–view–controller) design pattern, that describes software around the concept of Models (the M in MVC) that can be **C**reated, **R**ead, **U**pdated or **D**eleted (CRUD), handled by controllers and represented with views. This makes product and engineering teams speak slightly different languages that need a certain translation effort. Well-known frameworks like [Spring Boot](https://spring.io/projects/spring-boot) or [Ruby on Rails](https://rubyonrails.org) are good representatives of MVC/CRUD frameworks.

[Domain-Driven Design (DDD)](https://en.wikipedia.org/wiki/Domain-driven_design) aims to narrow this communication gap by using design patterns that are closer to the way humans and business stakeholders discuss the processes in their organizations. In DDD projects is frequent to use design patterns like [CQRS](https://www.martinfowler.com/bliki/CQRS.html) and [Event-Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html). Each user intent is 1:1 represented in code as a `Command`, everything that happens is expressed as `Events` (records of facts), and the state can be aggregated and consumed as `Read Models`.

### Compound complexity

As a software system scales, and subsequently the team behind of it grows, it's easy to start noticing how changes become more and more costly as time passes. It becomes harder for engineers to fully understand the codebase, and coupling between different parts of it makes that even the slightest change requires major code updates, even in unexpected files, making it harder to estimate the cost of a new feature beforehand.

One of the most compelling arguments of [Event Modeling](https://eventmodeling.org), a reference methodology to describe and design DDD and event-driven systems, is that software that follows CQRS+Event Sourcing patterns keep the coupling low enough to flatten the complexity curve. In traditional MVC+CRUD systems that are designed as a stateful resource store (models), it's common to find use cases that need to operate with more than one model at the same time. These relationships have to be handled at every layer, building a network of relationships over time that never stops growing.

Every new connection added to the system, has a multiplicative effect in complexity, generating an effect that is very similar to compound interest. While the size of every individual change seems negligible, these changes compound with each other and end up growing exponentially, but this is so gradual that it's hard to notice until everyone in the team start thinking that it may be worth a full rewrite (almost never is).

### Does CQRS+ES actually solve this?

Intuitively, we perceive that we need less relationships between different parts of the codebase when implementing a CQRS+ES system. Command handlers are all self-contained, they can access the data, but they do not operate directly on data, they use it to make decisions, and the decisions do not alter the data directly, but are expressed as events, which again, are just data. The same happens with event handlers. Command and event handlers are stateless, and operate on data exclusively.

But we want to go beyond intuition and illustrate this with data. In this repository we have implemented the same application twice. The first implementation follows a standard MVC+CRUD approach using the [NestJS](https://nestjs.com) framework. The second one, follows a CQRS+ES approach using the [Booster Framework](https://boosterframework.com). Also, we will use the TypeScript programming language.

For each feature implemented, we will track the following quantitative data:

1. Number of files created and number of files changed/deleted.
2. Number of functions/classes refactored.
3. Lines of code added and lines of code deleted.
4. Explicit Links: Number of explicit calls added/changed to constructors/functions from a different file.

We will also summarize the changes and share impressions for each iteration, and you will find a conclusion at the end of this document. Each iteration will be pushed in a separate commit to ease detailed inspection of the work made, and allowing others to reach their own conclusions.

Last but not least, this is an open repository intended for learning, so any fork, Pull Request or comment will be more than welcomed, even if you have a radically different opinion than us.

## Project description

We will implement the backend of a fictional KYC process for an online bank that allows their users to sign up online. A KYC (Know Your Customer) process is the process that any financial service needs to go through for each of their clients, collecting customers' personal, familiar, and occupation data to make sure they're eligible to be clients according to current regulations.

Our focus is on architectural complexity, so we'll assume that the actual data verification will be handled by 3rd party services that are integrated with our backend. More details on the assumptions will be added on each feature description.

> Disclaimer: It's important to highlight that the KYC process described here is for demonstration purposes only, with the intent of illustrating architectural differences between two well-known software architectures. This example should not be taken as a reference for real-world applications. If you plan to implement a KYC process for your own organization, ensure you seek proper guidance and consult with legal and compliance experts to meet all applicable regulatory requirements.

We will divide the project in 6 major milestones:

1. User registration:

    * Collect basic user information, such as name, address, date of birth, and contact details.
    * Obtain the user's Social Security number (SSN) or Tax Identification Number (TIN).

2. Identity verification:

    * Forward the user to an ID/Passport verification platform.
    * Verify user's government-issued identification document (e.g., driver's license, passport, or state-issued ID card).

3. Address verification:

    * Forward the user to an address verification platform that will collect a recent utility bill or bank statement as proof of address.

4. Background check:

    * Check user's information against government watchlists, such as the Office of Foreign Assets Control (OFAC) and Politically Exposed Persons (PEP) lists.
    * Perform a manual risk assessment based on the user's profile, occupation, and financial activity.

5. Family and occupation information:

    * Obtain information about user's family members, particularly those who may have political influence or connections.
    * Collect information about the user's occupation, employer, and source of income.

6. Security and monitoring:

    * Continuously monitor the user's account activity to identify any unusual or suspicious transactions.
    * Conduct periodic reviews of the user's information and update the risk assessment accordingly.

### Repository Structure

You'll find the full code of both NestJS and Booster projects in the corresponding folders:

* [`kyc-nest`](kyc-nest): Contains the NestJS implementation, which follows the MVC architectural pattern.
* [`kyc-booster`](kyc-booster): Contains the Booster Framework implementation, which follows the CQRS + Event Sourcing architectural pattern.

To run the projects, follow the instructions provided in the README file in each folder.

## Logbook

### Milestone 0: Project preparation

Minimal setup to build empty projects. We won't collect data for this iteration.

#### NestJS project ([2513803](https://github.com/boostercloud/kyc-example/commit/2513803c85c50d1f9601404277d126c9cf7a584d))

1. Install NestJS CLI and create a new project.
2. Install SQLite and TypeORM libraries.
3. Update the `ormconfig.json` file to use SQLite.

#### Booster project ([19dff43](https://github.com/boostercloud/kyc-example/commit/19dff43cc8b4f1abec46e46e6c6c3dc400232844))

1. Install Booster CLI and create a new project.

### Milestone 1: Profile creation

Profile creation is the first step in the KYC process, where the user provides their basic information such as name, address, date of birth, contact details, Social Security number (SSN), or Tax Identification Number (TIN). In order to track the profile state during the KYC process, we will also have a `kycStatus` field in the `Profile` entity with an initial status of `KYCPending`.

#### NestJS implementation steps ([48601ff](https://github.com/boostercloud/kyc-example/commit/48601ff550dc2e85d44cbe7c7db408205741ecb9))

1. Create a `ProfileController` that implements handlers for creating and reading profile HTTP endpoints.
2. Create a `Profile` entity that describes the profile object schema, as well as the valid states, defaulting to the initial state `KYCPending`.
3. Create a `ProfileService` class that implements the creation and finder methods for the profiles database table.
4. Create a `ProfileModule` that glues all the pieces together.
5. Update the `AppModule` to import the new module.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[AppModule];
    B[ProfileModule];
    C[ProfileController] -->|"create()"| D[ProfileService];
    C -->|"findAll()"| D;
    C -->|"findById()"| D;
    E[Profile];
    class A red;
    class B,C,D,E green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 4             | 1                     | 0         | 120       | 0           | 3              |

#### Booster Framework implementation steps ([8b8b360](https://github.com/boostercloud/kyc-example/commit/8b8b36044678f8243abdcaee8e2ba820265788ff))

1. Create the `CreateProfile` command with the required fields.
2. Create a `types` file for shared types like the `KYCStatus`.
3. Create the `ProfileCreated` event.
4. Create the `Profile` entity and set up the reducer function.
5. Create the `ProfileReadModel` read model and set up the projection function.

```mermaid
graph TD;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[CreateProfile command] -->|"constructor"| B[ProfileCreated event];
    C[Profile entity];
    D[KYCStatus type];
    E[ProfileReadModel];
    class A,B,C,D,E green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 5             | 0                     | 0         | 113       | 0           | 1              |

#### Milestone 1: Conclusions

For this first use case, the amount of files created, updated, and lines of code added and deleted, are similar, but we can already see how Booster adds less than a half of the links required in NestJS. The direction of the relationships are different too: in NestJS we find a tree-like structure, where the (root module) `AppModule` links the new `ProfileModule`, and then this one links together the corresponding controller, model and service. Then, the `ProfileController` uses the `ProfileService` to fulfill the requests. In Booster, we find full separation of write (`CreateProfile command`) and read (`ProfileReadModel`) pipelines, as expected due to the CQRS design, and both pipelines are solely connected by the `ProfileCreated event`.

### Milestone 2: ID Verification

In this milestone, we implement the identity (ID) verification process. We will assume that the user was redirected to an external ID verification service that will call a webhook in our service with the corresponding success or rejection status. The profile's `KYCStatus` should be updated accordingly. Apart from handling the webhook, the implementation also takes care of validating transitions between `KYCStatus` states.

#### NestJS implementation steps ([224b56c](https://github.com/boostercloud/kyc-example/commit/224b56c2f317c65f3ee957f6364e276a87358bae))

1. Create a `KYCController` that listens for webhook messages from the external ID verification service.
2. Create a `WebhookMessage` interface that defines the expected shape of the webhook event payload.
3. Create a `KYCService` class that validates the webhook message, processes the ID verification result, and updates the user's `KYCStatus`.
4. Create a `KYCModule` that brings all the new elements together, and imports the `ProfileModule` since it depends on the `ProfileService`.
5. Update `ProfileService` to add the `updateKycStatus` method to update the user's `KYCStatus` and to handle verification status transitions rules.
6. Update `ProfileModule` to export `ProfileService` so it can be used in the `KYCModule`.
7. Update `Profile` entity file to add new valid states to the `KYCStatus` type.
8. Update `AppModule` to import the new `KYCModule`.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[AppModule];
    I[KYCModule];
    B[ProfileModule];
    F[ProfileService];
    E[Profile];
    G[KYCController];
    H[KYCService];
    J[WebhookMessage];
    G -->|"handleWebhook()"| H;
    H -->|"update(success)"| F;
    H -->|"update(rejected)"| F;
    class A,B,F,E red;
    class G,H,I,J green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 4             | 4                     | 0         | 126       | 1           | 3              |

#### Booster Framework implementation steps ([4348e15](https://github.com/boostercloud/kyc-example/commit/8e15b5ccf72ef260bbb35b12a5605ebe5c970eb1))

1. Create the `ProcessIDVerification` command with the expected fields coming from the webhook.
2. Create the `IDVerificationSuccess` event.
3. Create the `IDVerificationRejected` event.
4. Create a `state-validation.ts` with a function for state transition validation.
5. Modify the `types.ts` file to add new valid states to the `KYCStatus` type (`KYCIDVerified` and `KYCIDRejected`)
6. Update the `Profile` entity with reducer functions for handling the new `IDVerificationSuccess` and `IDVerificationRejected` events.
7. Update the `ProfileReadModel` to add the new fields that expose verification metadata.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[ProcessIDVerification command] -->|"constructor"| B[IDVerificationSuccess event];
    A -->|"constructor"| C[IDVerificationRejected event];
    A -->|"read data"| D[Profile entity];
    A -->|"isValidTransition(success)"| E[State validation];
    A -->|"isValidTransition(rejection)"| E[State validation];
    F[KYCStatus type];
    G[ProfileReadModel];
    class A,E,B,C green;
    class D,F,G red;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 4             | 3                     | 0         | 116       | 2           | 5              |

#### Milestone 2: Conclusions

In this scenario, the statistics are very similar. This change involved structural changes in both projects for state management. In the NestJS project, we added a new `KYCController` to handle the verification webhook using `KYCService`. Then, the `KYCService` uses the `ProfilesModule` to explicitly update the entity.

In Booster, we introduced a new command that makes use of the existing entity and a new state validation function before accepting the incoming request, so all orchestration for this use case is made by the command itself, keeping the new use case self-contained. State management is handled treating the events and entities as data, so no explicit state management is needed, showing a better distribution of responsibilities.

### Milestone 3: Address Verification

In this milestone, we implement the address verification process. As we did the ID verification process, we'll simulate that we redirect the user to an external verification service. This service will then call our KYC service back with the verification outcome (Success or rejected). We must update the profile's `KYCStatus` to reflect this result. In addition to processing the webhook, our implementation is also responsible for ensuring the validity of transitions between different `KYCStatus` states.

#### NestJS implementation steps ([bec8b97](https://github.com/boostercloud/kyc-example/commit/bec8b973316af3225469885a59c87d56ee688607))

1. Refactor the `KYCController` to separate ID verification and address verification webhook handlers.
2. Refactor the `KYCService` to create separate methods for handling ID verification and address verification webhook messages.
3. Update the `webhook-message.interface.ts` file to rename the existing interface of the ID verification webhook schema and add a new one for address verification.
4. Update the `Profile` file to add new valid states to the `KYCStatus` type for address verification (`KYCAddressVerified` and `KYCAddressRejected`) as well as new fields to keep track of validation.
5. Refactored the `ProfileService` to better handle address verification status transitions.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    A[KYCController] -->|"handleIdVerificationWebhook"| B[KYCService]
    A -->|"handleAddressVerificationWebhook"| B
    B -->|"update(address success)"| D[ProfileService]
    B -->|"update(address rejected)"| D
    E[Profile]
    C[webhook message interface]
    class A,B,C,D,E red;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 0             | 5                     | 3         | 116       | 18          | 4              |

#### Booster implementation steps ([727d3ce](https://github.com/boostercloud/kyc-example/commit/727d3ce6f062784250b905336bcc44d27a4c6028))

1. Create the command `ProcessAddressVerification` with the expected fields coming from the webhook.
2. Created the `AddressVerificationRejected` event.
3. Created the `AddressVerificationSuccess` event.
4. Updated the `Profile` entity to reduce the new events and add new fields.
5. Updated the `ProfileReadModel` to expose the new fields.
6. Refactored the helper functions in the `state-validation.ts` file to handle the new states.
7. Updated the `types.ts` file to add the new required states (`KYCAddressVerified` and `KYCAddressRejected`)

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[ProcessAddressVerification command] -->|"constructor"| B[AddressVerificationSuccess event]
    A -->|"constructor"| C[AddressVerificationRejected event]
    A -->|"isValidTransition(success)"| D[State validation]
    A -->|"isValidTransition(rejection)"| D[State validation]
    A -->|"read state"| E[Profile entity]
    F[ProfileReadModel]
    G[KYCStatus type]
    class A,B,C green;
    class D,E,F,G red;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 3             | 4                     | 1         | 156       | 16          | 5              |

#### Milestone 3: Conclusions

In this iteration we see a few differences between the two codebases:

* As we're reusing the existing `KYCController` in NestJS, we didn't add any new files. All changes required changing existing files. This required extra refactors in two files, to accomodate the new features in an idiomatic way, and this refactor introduced a breaking API change.
* In Booster, the new use case was implemented as a brand new command, so no previous code was affected. Also, we see the pattern from the previous iteration again: all orchestration between different modules are made in the command. This means that this feature can be easily developed in isolation.
* One detail worth noting from the NestJS project is that we, as developers, are responsible to decide whether to include new functionality in an existing controller or create a new one. This means that there's a higher variability on the application design, as some developers might decide to create new controllers for each features, and others might decide to avoid refactoring existing code despite ending up with code that's not easy to understand. In the Booster the framework, the framework architecture clearly defines how to add new functionality, making Booster projects potentially more repeatable.
* We also refactored the state validation function in both projects, which didn't introduce API changes.

### Milestone 4: Background check

In this milestone we will simulate an automated background check process. When the profile reaches the state `KYCAddressVerified`, we will make a series of simulated requests to the OFAC (Office of Foreign Assets Control) and the PEP (Political Exposed Person) databases to check if the user is in any of these lists. If the user is not on these lists, it will be set in the state `KYCBackgroundCheckPassed` automatically, but if they're present in any of these lists, it will be moved to a `KYCBackgroundCheckRequiresManualReview` state that a human will have to resolve. We will then expose a new endpoint to allow a human reviewer sending the final veredict, which can pass the user to either the `KYCBackgroundCheckPassed` or the `KYCBackgroundCheckRejected` state.

#### NestJS implementation steps ([b5371fa](https://github.com/boostercloud/kyc-example/commit/b5371faf11d34b4afa253d92bf909e4c2eab7b69))

1. Minor change in `AppModule` to enable environment variables.
2. Renamed and updated the file that holds the KYC API messages, now named `API Messages interfaces`.
3. Updated the `KYCController` to add a new `/submit-manual-background-check` endpoint.
4. Minor update in the `KYCModule` to enable access to environment variables.
5. Changed the `handleAddressVerification` method in `KYCService` to chain the background check after the address has been validated and added all the logic needed to perform the corresponding HTTP calls to the simulated external services.
6. Changed the `Profile` entity file to add the new states and fields.
7. Changed the `ProfileService` to handle the new states.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    A[AppModule]
    C[API Messages Interface]
    B[KYCController] -->|"submitManualBackgroundCheck"| D[KYCService]
    D -->|"manual update(BG check passed)"| F[ProfileService]
    D -->|"manual update(BG check rejected)"| F[ProfileService]
    D -->|"automated update(BG check passed)"| F[ProfileService]
    D -->|"automated update(needs manual check)"| F[ProfileService]
    G[Profile]
    E[KYCModule]
    class A,B,C,D,E,F,G red;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 0             | 7                     | 0         | 252       | 88          | 5              |

#### Booster implementation steps ([b87e175](https://github.com/boostercloud/kyc-example/commit/b87e175b9c2a393848787f5dcaaf2e5d55cbee2e))

1. Changed the `CreateProfile command` signature to accept new fields.
2. Created a new `SubmitBackgroundCheck command` to let reviewers submit manual background check results.
3. Changed the `state-validation.ts` file to handle the new states.
4. Changed the `KYCStatus type` to include the new states (`KYCBackgroundCheckPassed`, `KYCBackgroundCheckRequiresManualReview` and `KYCBackgroundCheckRejected`).
5. Changed the `Profile entity` to include the new fields and reduce the new events.
6. Created the `TriggerBackgroundCheck event handler` to handle the automated background check after the event `AddressVerificationSuccess` happens.
7. Created the `BackgroundCheckManualReviewRequired` event to represent an unconclysive automated background check.
8. Created the `BackgroundCheckPassed` event to represent that the profile passed the background check.
9. Created the `BackgroundCheckRejected` event to represent that a profile was rejected.
10. Changed the `ProfileCreated event` to include the extra fields for the profile.
11. Changed the `ProfileReadModel` to include the extra fields added by this use case.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A[CreateProfile command];
    B[SubmitBackgroundCheck command] -->|"read profile"| C["Profile entity"]
    B -->|"isValidTransition(passed)"| D["State Validation"]
    B -->|"isValidTransition(rejected)"| D["State Validation"]
    B -->|"constructor"| E["BackgroundCheckPassed event"]
    B -->|"constructor"| F["BackgroundCheckRejected event"]
    G["KYCStatus type"]
    H["TriggerBackgroundCheck event handler"] -->|"read profile"| C
    H -->|"constructor"| E
    H -->|"constructor"| K["BackgroundCheckManualReviewRequired event"]
    I["ProfileCreated event"]
    J["ProfileReadModel"]
    class A,C,D,G,I,J red;
    class B,E,F,H,K green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 5             | 6                     | 0         | 328       | 22          | 8              |

#### Milestone 4: Conclusions

In this milestone we implemented a more complicated scenario that had two new features, so the amount of code needed was noticeably higher in both projects than in previous iterations. The NestJS project shows that the new features could have been implemented touching fewer files, but that also means that these files accumulate more responsibility. In the Booster project, we can see how, once more, the features are relatively contained in the new `SubmitBackgroundCheck command` and the `TriggerBackgroundCheck event handler`. Each feature's business logic is fully written in the command and the event handler, so the responsibility of each class is more clearly defined. While the Booster implementation has more moving pieces, it's also true that all new code has been implemented in new independent files and both the number of files changes and the ratio between lines of code added vs lines of code deleted are smaller in Booster.

One detail worth noticing is that as the background check must be tried automatically after the address has been verified, these use cases are chained. In NestJS, the background check is called from the same controller method that checks the address verification. This design has two flaws: one is that both use cases are performed synchronously in the context of the same HTTP request, so failure scenarios or partial successes can become hard to manage afterwards (i.e. as the system is designed, it's not easy to retry the background check independently). Booster allows, with the use of event handlers, to listen to specific changes and react to them with extra independent actions. This doesn't require any changes in the original feature, the event handlers will be handled asynchronously, and they can be retried in isolation.

### Milestone 5: Family and occupation risk assessment

In this milestone, we'll add occupation information to the existing profiles and introduce the concept of relative, adding a 1-M relationship. We're going to assume that all this information will be vetted manually by the organization employee, so we'll just implement collection of the data and its exposure via API.

#### NestJS implementation steps ([26d30f1](https://github.com/boostercloud/kyc-example/commit/26d30f1cf3a766c4c18e6209fc9ef25404303b4c)))

1. Changed the `AppModule` to include the new `RelativeModule`.
2. Changed the `ProfileController` to handle a new endpoint to update an existing profile.
3. Changed the `Profile` entity to include the new fields and add the `relatives` 1-M relationship.
4. Changed the `ProfileService`'s `findById` method to also return the relatives related to the requested profile.
5. Created a new `RelativeController` to handle the relatives creation (scoped to a specific profile).
6. Created the new `Relative` entity, including the inverse M-1 relationship with the profile.
7. Created a new `RelativeModule` to connect all the relative pieces together.
8. Created the `RelativeService` that implements the creation of relatives associated with a profile.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A["AppModule"]
    B["ProfileController"] -->|"update"| C["ProfileService"]
    D["Profile"]
    E["RelativeController"] -->|"create"| F["RelativeService"]
    G["Relative"]
    F -->|"findById"| C
    class A,B,C,D red;
    class E,F green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 4             | 4                     | 0         | 118       | 2           | 3              |

#### Booster implementation steps ([f963d88](https://github.com/boostercloud/kyc-example/commit/f963d88348573586ed24cde31a928cf28a452861)))

1. Created a new dedicated `AddProfileOccupationData command` that allows users submit these fields independently.
2. Created a new `CreateRelative command` to add relatives to a specific profile.
3. Changed the `types.ts` file to add a new `IncomeSource` type that represents valid income source options.
4. Changed the `Profile entity` to add extra fields and reduce the `ProfileOcupationDataAdded event`.
5. Created the `Relative` entity that reduces the `RelativeCreated event`.
6. Created the `ProfileOcupationDataAdded event`.
7. Created the `RelativeCreated` event.
8. Changed the `ProfileReadModel` to show the new profile fields and the related relatives.

```mermaid
graph TD;
    classDef red fill:#ff6666,stroke:#333,stroke-width:4px;
    classDef green fill:#00cc66,stroke:#333,stroke-width:4px;
    A["AddProfileOccupationData command"] -->|"constructor"| B["ProfileOcupationDataAdded event"]
    C["CreateRelative command"] -->|"constructor"| D["RelativeCreated event"]
    E["types.ts"]
    F["Profile entity"]
    G["Relative entity"]
    H["ProfileReadModel"]
    class E,F,H red;
    class A,B,C,D,G green;
```

| Files Created | Files Changed/Deleted | Refactors | LoC Added | LoC Deleted | Explicit Links |
| ------------- | --------------------- | --------- | --------- | ----------- | -------------- |
| 5             | 3                     | 0         | 192       | 30          | 2              |

#### Milestone 5: Conclusions

This milestone involved again the implementation of two use cases: add the occupation data, and add relatives to a specific profile. They're both relatively simple use cases, so the main difference we can notice is because of the creation of a relationship between two entities (The profile and the new relative entity). In NestJS, the relationship is defined explicitly in the model, but in Booster the relation is not made explicit until the moment of building the read model. As we saw in previous iterations, in Booster the new use cases are implemented in two independent commands that are self-contained while in Nest one of the use cases is implemented in an existing controller and the other in a new one.

### Milestone 6: Security and monitoring

In this milestone, we won't modify the implementation, as security and monitoring topics often extend beyond the scope of a specific service. However, it's important to highlight and analyze security and monitoring aspects and how they apply to the NestJS and Booster implementations.

In the context of a KYC process with a focus on security and monitoring, the event-sourcing approach offers several advantages, such as proactive monitoring, complete audit trail, and fine-grained access control.

1. **Proactive monitoring**: With event-sourcing, every user action generates an event that can be forwarded to an event aggregation platform for real-time analysis. This allows us to use machine learning models or other techniques to proactively monitor user activity and identify unusual or suspicious transactions.

2. **Complete audit trail**: Event-sourcing inherently stores incremental changes to the user's profile, providing a comprehensive audit trail and facilitating regulatory compliance. In contrast, the MVC design would overwrite the previous states, making it difficult to reconstruct the user's profile history.

3. **Fine-grained access control**: Booster Framework allows for a more granular approach to access control during the KYC process. By decoupling the API from the entities, we can define specific commands for different stages of the profile update process. This enforces a strict workflow and ensures that users cannot bypass the designed process.

In a MVC implementation, these techniques can be also implemented, but require an extra effort of the development team. In order to have a permanent trail of changes, you would need to extract the implicit events and send them to the events aggregation platform. One way to do this would be to explicitly log the events after every database write in your code, which is error prone (if a developer forgets to record the corresponding events for an action, the data is lost forever). Another way is implementing a CDC process in the database that records every change, which is more exhaustive than implementing it in code, but it loses the semantics of the change.

Regarding access control, the MVC most idiomatic approach is to expose create/update endpoints for each entity and handle the special cases and workflows in the controller/service implementation. For instance, if we want to restrict the fields sent during profile creation to a specific subset of the profile entity's fields, we would need to implement that with a series of conditionals in the service that filter out the extra fields or rejects a request depending on the fields sent and the current state of the profile. Again, this is perfectly doable and it's a common way to solve it in MVC applications, but it's easier to make a mistake than when you have a specific endpoint for each command.