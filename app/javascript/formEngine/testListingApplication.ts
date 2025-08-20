const schema = {
  formType: "listingApplication",
  formSubType: "defaultRental",
  componentType: "multiStepLayout",
  componentName: "ListingApplyFormWrapper",
  children: [
    {
      stepInfo: {
        slug: "intro",
        hideLayout: true,
      },
      componentType: "step",
      componentName: "ListingApplyIntro",
    },
    {
      stepInfo: { slug: "overview" },
      componentType: "step",
      componentName: "ListingApplyOverview",
    },
    {
      stepInfo: {
        slug: "name",
        sectionName: "you",
      },
      componentType: "step",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "b1Name.title",
      },
      children: [
        {
          componentName: "Name",
          props: {
            label: "label.yourName",
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
            label: "label.yourDob",
            fieldNames: { dateOfBirth: "primaryApplicantDob" },
          },
        },
        {
          componentName: "EmailAddress",
          fieldNames: { email: "primaryApplicantEmail" },
          props: {
            label: "label.applicantEmail",
            showDontHaveEmailAddress: true,
          },
        },
      ],
    },
    {
      stepInfo: {
        slug: "contact",
        sectionName: "you",
      },
      componentType: "step",
      componentName: "ListingApplyStepWrapper",
      props: {
        title: "b2Contact.title",
        titleVariables: {
          name: { dataSource: "form", dataKey: "primaryApplicantFirstName" },
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
    // {
    //   stepInfo: {
    //     slug: "verify-address",
    //     sectionName: "you",
    //   },
    //   componentType: "step",
    //   componentName: "VerifyAddress",
    //   props: {
    //     address: "primaryApplicantAddress",
    //   },
    // },
    // {
    //   stepInfo: {
    //     slug: "alternate-contact-type",
    //     sectionName: "household",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     section: "you",
    //     title: "b3AlternateContactType.title",
    //     description: "b3AlternateContactType.allowingToDiscuss",
    //   },
    //   children: [
    //     {
    //       componentName: "AlternateContactType",
    //       props: {
    //         fieldNames: { alternateContactType: "alternateContactType" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "alternate-contact-name",
    //     sectionName: "household",
    //     navigation: {
    //       showStepIfAnyPresent: [{ dataSource: "form", dataKey: "alternateContactType" }],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "b4AlternateContactName.title",
    //   },
    //   children: [
    //     {
    //       componentName: "Name",
    //       props: {
    //         label: "name of alternate contact",
    //         showMiddleName: false,
    //         fieldNames: {
    //           firstName: "alternateContactFirstName",
    //           middleName: "alternateContactMiddleName",
    //           lastName: "alternateContactLastName",
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "alternate-contact-phone-address",
    //     sectionName: "household",
    //     navigation: {
    //       showStepIfAnyPresent: [{ dataSource: "form", dataKey: "alternateContactType" }],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     section: "",
    //     title: "b4aAlternateContactPhoneAddress.title",
    //     description: "b4aAlternateContactPhoneAddress.onlyUseInfo",
    //   },
    //   children: [
    //     {
    //       componentName: "Phone",
    //       props: {
    //         label: "contact phone number",
    //         fieldNames: { phone: "alternateContactPhone" },
    //       },
    //     },
    //     {
    //       componentName: "EmailAddress",
    //       props: {
    //         label: "contact email address",
    //         fieldNames: { email: "alternateContactEmail" },
    //       },
    //     },
    //     {
    //       componentName: "Address",
    //       props: {
    //         label: "contact mailing address",
    //         fieldNames: { address: "alternateContactAddress" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "household-intro",
    //     sectionName: "household",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyHouseholdIntro",
    //   props: {
    //     fieldNames: { liveAlone: "_liveAlone" },
    //   },
    // },
    // {
    //   stepInfo: { slug: "household-overview", sectionName: "household" },
    //   componentType: "step",
    //   componentName: "ListingApplyHouseholdOverview",
    // },
    // {
    //   stepInfo: {
    //     slug: "household-members",
    //     sectionName: "household",
    //     navigation: {
    //       hideStepIfAnyPresent: [{ dataSource: "form", dataKey: "liveAlone" }],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "AddHouseholdMembers",
    //   props: {
    //     fieldNames: { addHouseHoldMember: "_addHouseHoldMember" },
    //   },
    // },
    // {
    //   stepInfo: {
    //     slug: "household-member-form",
    //     sectionName: "household",
    //     navigation: {
    //       showStepIfAnyPresent: [{ dataSource: "form", dataKey: "_addHouseHoldMember" }],
    //       nextStep: "household-members",
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "c3HouseholdMemberForm.title",
    //     description: "c3HouseholdMemberForm.p1",
    //   },
    //   children: [
    //     // TODO how to group all fields on this page into a household member object in the form state?
    //     {
    //       componentName: "Name",
    //       props: {
    //         label: "household member's name",
    //         showMiddleName: true,
    //         fieldNames: {
    //           firstName: "householdMemberFirstName",
    //           middleName: "householdMemberMiddleName",
    //           lastName: "householdMemberLastName",
    //         },
    //       },
    //     },
    //     {
    //       componentName: "DateOfBirth",
    //       props: {
    //         label: "your date of birth",
    //         fieldNames: { dateOfBirth: "primaryApplicantDob" },
    //       },
    //     },
    //     {
    //       componentName: "HouseholdMemberSameAddress",
    //       props: {
    //         fieldNames: {
    //           address: "householdMemberAddress",
    //         },
    //       },
    //     },
    //     {
    //       componentName: "YesNoRadio",
    //       props: {
    //         label: "label.memberWorkInSf",
    //         description: "c3HouseholdMemberForm.workInSfDesc",
    //         fieldNames: { question: "householdMemberWorkInSf" },
    //       },
    //     },
    //     {
    //       componentName: "Select",
    //       props: {
    //         label: "what is their relationship to you?",
    //         defaultOptionName: "Select One",
    //         options: [
    //           {
    //             name: "Spouse",
    //             value: "spouse",
    //           },
    //           {
    //             name: "Registered Domestic Partner",
    //             value: "Registered Domestic Partner",
    //           },
    //         ],
    //         fieldNames: { selection: "householdMemberRelation" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "household-priorities",
    //     sectionName: "household",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "c7HouseholdPriorities.titleHousehold",
    //     description: "c7HouseholdPriorities.p1",
    //   },
    //   children: [
    //     {
    //       componentName: "PrioritiesCheckbox",
    //       fieldNames: {
    //         members: "priorityMembers",
    //       },
    //       props: {
    //         description: "label.pleaseSelectAllThatApply",
    //         members: { dataSource: "form", dataKey: "householdMembersArray" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "income-vouchers",
    //     sectionName: "income",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "d1IncomeVouchers.titleHousehold",
    //     descriptionComponentName: "incomeVoucherDescription",
    //   },
    //   children: [
    //     {
    //       componentName: "YesNoRadio",
    //       props: {
    //         note: "label.pleaseSelectOne",
    //         yesText: "d1IncomeVouchers.ifSubsidyWarning",
    //         fieldNames: { question: "receivesIncomeVouchers" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "income-household",
    //     sectionName: "income",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "d2Income.title",
    //     descriptionComponentName: "incomeVoucherDescription",
    //   },
    //   children: [
    //     {
    //       componentName: "Currency",
    //       props: {
    //         placeholder: "total all of your income sources",
    //         fieldNames: { amount: "householdIncome" },
    //       },
    //     },
    //     {
    //       componentName: "Radio",
    //       props: {
    //         options: [
    //           { name: "per month", value: "12" },
    //           { name: "per year", value: "1" },
    //         ],
    //         fieldNames: { answer: "householdIncomeMultiplier" },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "preferences-intro",
    //     sectionName: "preferences",
    //   },
    //   componentName: "PreferencesIntro",
    // },
    // {
    //   stepInfo: {
    //     slug: "live-work-preference",
    //     sectionName: "preferences",
    //     navigation: {
    //       showStepIfAnyPresent: [
    //         { dataSource: "form", dataKey: "_addressNeighborhoodMatch" },
    //         { dataSource: "listing", dataKey: "preferences.liveWorkInSf" },
    //         { dataSource: "listing", dataKey: "preferences.liveInSf" },
    //         { dataSource: "listing", dataKey: "preferences.workInSf" },
    //       ],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "e2cLiveWorkPreference.title",
    //     description: "e2cLiveWorkPreference.instructions",
    //   },
    //   children: [
    //     {
    //       componentName: "LiveWorkPreference",
    //       props: {
    //         listingPreferences: { dataSource: "listing", dataKey: "preferences" },
    //         fieldNames: {
    //           liveInSfMember: "liveInSfMember",
    //           liveInSfProofType: "liveInSfProofType",
    //           liveInSfProofDoc: "liveInSfProofDoc",
    //           workInSfMember: "workInSfMember",
    //           workInSfProofType: "workInSfProofType",
    //           workInSfProofDoc: "workInSfProofDoc",
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "preferences-programs",
    //     sectionName: "preferences",
    //     navigation: {
    //       showStepIfAnyPresent: [
    //         { dataSource: "listing", dataKey: "preferences.certOfPreference" },
    //         { dataSource: "listing", dataKey: "preferences.displaced" },
    //       ],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "e7PreferencesPrograms.title",
    //     description: "e7PreferencesPrograms.haveNotHeardOfPreferences",
    //   },
    //   children: [
    //     {
    //       componentName: "CopPreference",
    //       props: {
    //         listingPreferences: { dataSource: "listing", dataKey: "preferences" },
    //         fieldNames: {
    //           copMember: "copMember",
    //           copNumber: "copNumber",
    //         },
    //       },
    //     },
    //     {
    //       componentName: "DthpPreference",
    //       props: {
    //         listingPreferences: { dataSource: "listing", dataKey: "preferences" },
    //         fieldNames: {
    //           dthpMember: "dthpMember",
    //           dthpNumber: "dthpNumber",
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "veterans-programs",
    //     sectionName: "preferences",
    //     navigation: {
    //       showStepIfAnyPresent: [
    //         { dataSource: "listing", dataKey: "preferences.certOfPreference" },
    //         { dataSource: "listing", dataKey: "preferences.displaced" },
    //       ],
    //     },
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyStepWrapper",
    //   props: {
    //     title: "e7a_veterans_preference.title",
    //     descriptionComponentName: "veteransDescription",
    //   },
    //   children: [
    //     {
    //       componentName: "VeteranRadio",
    //       props: {
    //         fieldNames: {
    //           veteranMember: "veteranMember",
    //           veteranAnswer: "veteranAnswer",
    //         },
    //       },
    //     },
    //   ],
    // },
    // {
    //   stepInfo: {
    //     slug: "review-optional",
    //     sectionName: "review",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyDemographics",
    // },
    // {
    //   stepInfo: {
    //     slug: "review-summary",
    //     sectionName: "review",
    //   },
    //   componentType: "step",
    //   componentName: "ListingApplyReviewInformation",
    // },
    {
      stepInfo: {
        slug: "review-terms",
        sectionName: "review",
      },
      componentType: "step",
      componentName: "ListingApplyReviewTerms",
    },
  ],
}

export default schema
