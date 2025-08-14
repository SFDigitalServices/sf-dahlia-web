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
      stepInfo: {
        slug: "overview",
      },
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
        titleVars: {
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
