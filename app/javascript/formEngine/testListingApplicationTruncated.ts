const schema = {
  formType: "listingApplication",
  formSubType: "defaultRental",
  componentName: "ListingApplyFormLayout",
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
      slug: "review-terms",
      sectionName: "review",
      componentType: "page",
      componentName: "ListingApplyReviewTerms",
    },
  ],
}

export default schema
