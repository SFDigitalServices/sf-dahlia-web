const schema = {
  formType: "listingApplication",
  formSubType: "defaultRental",
  children: [
    {
      slug: "intro",
      componentType: "pageNoNav",
      componentName: "ListingApplyIntro",
    },
    {
      slug: "overview",
      componentType: "page",
      componentName: "ListingApplyOverview",
    },
    {
      slug: "name",
      sectionName: "you",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "b1Name.title",
      },
      children: [
        {
          componentName: "Name",
          props: {
            label: "your name",
            fieldNames: {
              firstName: "primaryApplicantFirstName",
              middleName: "primaryApplicantMiddleName",
              lastName: "primaryApplicantLastName",
            },
            showMiddleName: true,
          },
        },
        {
          componentName: "DateOfBirth",
          props: {
            label: "your date of birth",
            fieldNames: { dateOfBirth: "primaryApplicantDob" },
          },
        },
        {
          componentName: "EmailAddress",
          fieldNames: { email: "primaryApplicantEmail" },
          props: {
            label: "your email address",
            showDontHaveEmailAddress: true,
          },
        },
      ],
    },
    {
      slug: "contact",
      sectionName: "you",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "b2Contact.title",
        titleVariables: {
          name: { dataSource: "form", key: "primaryApplicantFirstName" },
        },
      },
      children: [
        {
          componentName: "Phone",
          props: {
            label: "your phone number",
            showTypeOfNumber: true,
            showDontHavePhoneNumber: true,
            showAdditionalPhoneNumber: true,
            labelForAdditionalPhoneNumber: "your second phone number",
            fieldNames: {
              phone: "primaryApplicantPhone",
              additionalPhone: "primaryApplicantAdditionalPhone",
            },
          },
        },
        {
          componentName: "Address",
          props: {
            label: "address",
            showMailingAddress: true,
            fieldNames: {
              address: "primaryApplicantAddress",
              mailingAddress: "primaryApplicantMailingAddress",
            },
          },
        },
        {
          componentName: "YesNoRadio",
          props: {
            label: "label.workInSf",
            note: "b2Contact.workInSfDesc",
            fieldNames: { question: "primaryApplicantWorkInSf" },
          },
        },
      ],
    },
    {
      slug: "verify-address",
      sectionName: "you",
      componentType: "page",
      componentName: "VerifyAddress",
      props: {
        address: "primaryApplicantAddress",
      },
    },
    {
      slug: "alternate-contact-type",
      sectionName: "household",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        section: "you",
        title: "b3AlternateContactType.title",
        description: "b3AlternateContactType.allowingToDiscuss",
      },
      children: [
        {
          componentName: "AlternateContactType",
          props: {
            fieldNames: { alternateContactType: "alternateContactType" },
          },
        },
      ],
    },
    {
      slug: "alternate-contact-name",
      sectionName: "household",
      navigation: {
        showStepIfAnyPresent: [{ dataSource: "form", key: "alternateContactType" }],
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "b4AlternateContactName.title",
      },
      children: [
        {
          componentName: "Name",
          props: {
            label: "name of alternate contact",
            showMiddleName: false,
            fieldNames: {
              firstName: "alternateContactFirstName",
              middleName: "alternateContactMiddleName",
              lastName: "alternateContactLastName",
            },
          },
        },
      ],
    },
    {
      slug: "alternate-contact-phone-address",
      sectionName: "household",
      navigation: {
        showStepIfAnyPresent: [{ dataSource: "form", key: "alternateContactType" }],
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        section: "",
        title: "b4aAlternateContactPhoneAddress.title",
        description: "b4aAlternateContactPhoneAddress.onlyUseInfo",
      },
      children: [
        {
          componentName: "Phone",
          props: {
            label: "contact phone number",
            fieldNames: { phone: "alternateContactPhone" },
          },
        },
        {
          componentName: "EmailAddress",
          props: {
            label: "contact email address",
            fieldNames: { email: "alternateContactEmail" },
          },
        },
        {
          componentName: "Address",
          props: {
            label: "contact mailing address",
            fieldNames: { address: "alternateContactAddress" },
          },
        },
      ],
    },
    {
      slug: "household-intro",
      sectionName: "household",
      componentType: "page",
      componentName: "ListingApplyHouseholdIntro",
      props: {
        fieldNames: { liveAlone: "_liveAlone" },
      },
    },
    {
      slug: "household-overview",
      sectionName: "household",
      componentType: "page",
      componentName: "ListingApplyHouseholdOverview",
    },
    {
      slug: "household-members",
      sectionName: "household",
      navigation: {
        hideStepIfAnyPresent: [{ dataSource: "form", key: "liveAlone" }],
      },
      componentType: "page",
      componentName: "AddHouseholdMembers",
      props: {
        fieldNames: { addHouseHoldMember: "_addHouseHoldMember" },
      },
    },
    {
      slug: "household-member-form",
      sectionName: "household",
      navigation: {
        showStepIfAnyPresent: [{ dataSource: "form", key: "_addHouseHoldMember" }],
        nextStep: "household-members",
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "c3HouseholdMemberForm.title",
        description: "c3HouseholdMemberForm.p1",
      },
      children: [
        // TODO how to group all fields on this page into a household member object in the form state?
        {
          componentName: "Name",
          props: {
            label: "household member's name",
            showMiddleName: true,
            fieldNames: {
              firstName: "householdMemberFirstName",
              middleName: "householdMemberMiddleName",
              lastName: "householdMemberLastName",
            },
          },
        },
        {
          componentName: "DateOfBirth",
          props: {
            label: "your date of birth",
            fieldNames: { dateOfBirth: "primaryApplicantDob" },
          },
        },
        {
          componentName: "HouseholdMemberSameAddress",
          props: {
            fieldNames: {
              address: "householdMemberAddress",
            },
          },
        },
        {
          componentName: "YesNoRadio",
          props: {
            label: "label.memberWorkInSf",
            description: "c3HouseholdMemberForm.workInSfDesc",
            fieldNames: { question: "householdMemberWorkInSf" },
          },
        },
        {
          componentName: "Select",
          props: {
            label: "what is their relationship to you?",
            defaultOptionName: "Select One",
            options: [
              {
                name: "Spouse",
                value: "spouse",
              },
              {
                name: "Registered Domestic Partner",
                value: "Registered Domestic Partner",
              },
            ],
            fieldNames: { selection: "householdMemberRelation" },
          },
        },
      ],
    },
    {
      slug: "household-priorities",
      sectionName: "household",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "c7HouseholdPriorities.titleHousehold",
        description: "c7HouseholdPriorities.p1",
      },
      children: [
        {
          componentName: "PrioritiesCheckbox",
          fieldNames: {
            members: "priorityMembers",
          },
          props: {
            description: "label.pleaseSelectAllThatApply",
            members: { dataSource: "form", key: "householdMembersArray" },
          },
        },
      ],
    },
    {
      slug: "income-vouchers",
      sectionName: "income",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "d1IncomeVouchers.titleHousehold",
        descriptionComponentName: "incomeVoucherDescription",
      },
      children: [
        {
          componentName: "YesNoRadio",
          props: {
            note: "label.pleaseSelectOne",
            yesText: "d1IncomeVouchers.ifSubsidyWarning",
            fieldNames: { question: "receivesIncomeVouchers" },
          },
        },
      ],
    },
    {
      slug: "income-household",
      sectionName: "income",
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "d2Income.title",
        descriptionComponentName: "incomeVoucherDescription",
      },
      children: [
        {
          componentName: "Currency",
          props: {
            placeholder: "total all of your income sources",
            fieldNames: { amount: "householdIncome" },
          },
        },
        {
          componentName: "Radio",
          props: {
            options: [
              { name: "per month", value: "12" },
              { name: "per year", value: "1" },
            ],
            fieldNames: { answer: "householdIncomeMultiplier" },
          },
        },
      ],
    },
    {
      slug: "preferences-intro",
      sectionName: "preferences",
      componentName: "PreferencesIntro",
    },
    {
      slug: "live-work-preference",
      sectionName: "preferences",
      navigation: {
        showStepIfAnyPresent: [
          { dataSource: "form", key: "_addressNeighborhoodMatch" },
          { dataSource: "listing", key: "preferences.liveWorkInSf" },
          { dataSource: "listing", key: "preferences.liveInSf" },
          { dataSource: "listing", key: "preferences.workInSf" },
        ],
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "e2cLiveWorkPreference.title",
        description: "e2cLiveWorkPreference.instructions",
      },
      children: [
        {
          componentName: "LiveWorkPreference",
          props: {
            listingPreferences: { dataSource: "listing", key: "preferences" },
            fieldNames: {
              liveInSfMember: "liveInSfMember",
              liveInSfProofType: "liveInSfProofType",
              liveInSfProofDoc: "liveInSfProofDoc",
              workInSfMember: "workInSfMember",
              workInSfProofType: "workInSfProofType",
              workInSfProofDoc: "workInSfProofDoc",
            },
          },
        },
      ],
    },
    {
      slug: "preferences-programs",
      sectionName: "preferences",
      navigation: {
        showStepIfAnyPresent: [
          { dataSource: "listing", key: "preferences.certOfPreference" },
          { dataSource: "listing", key: "preferences.displaced" },
        ],
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "e7PreferencesPrograms.title",
        description: "e7PreferencesPrograms.haveNotHeardOfPreferences",
      },
      children: [
        {
          componentName: "CopPreference",
          props: {
            listingPreferences: { dataSource: "listing", key: "preferences" },
            fieldNames: {
              copMember: "copMember",
              copNumber: "copNumber",
            },
          },
        },
        {
          componentName: "DthpPreference",
          props: {
            listingPreferences: { dataSource: "listing", key: "preferences" },
            fieldNames: {
              dthpMember: "dthpMember",
              dthpNumber: "dthpNumber",
            },
          },
        },
      ],
    },
    {
      slug: "veterans-programs",
      sectionName: "preferences",
      navigation: {
        showStepIfAnyPresent: [
          { dataSource: "listing", key: "preferences.certOfPreference" },
          { dataSource: "listing", key: "preferences.displaced" },
        ],
      },
      componentType: "page",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "e7a_veterans_preference.title",
        descriptionComponentName: "veteransDescription",
      },
      children: [
        {
          componentName: "VeteranRadio",
          props: {
            fieldNames: {
              veteranMember: "veteranMember",
              veteranAnswer: "veteranAnswer",
            },
          },
        },
      ],
    },
    {
      slug: "review-optional",
      sectionName: "review",
      componentType: "page",
      componentName: "ListingApplyDemographics",
    },
    {
      slug: "review-summary",
      sectionName: "review",
      componentType: "page",
      componentName: "ListingApplyReviewInformation",
    },
    {
      slug: "review-terms",
      sectionName: "review",
      componentType: "page",
      componentName: "ListingApplyReviewTerms",
    },
  ],
}

export default schema
