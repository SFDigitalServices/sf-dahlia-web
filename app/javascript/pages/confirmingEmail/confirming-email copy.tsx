// import React from "react"
// import withAppSetup from "../../layouts/withAppSetup"
// import { FormCard, Heading } from "@bloom-housing/ui-components"
// import FormLayout from "../../layouts/FormLayout"
// // import Link from "../../navigation/Link"

// // TODO: rename props
// interface HomePageProps {
//   assetPaths: unknown
// }

// const ConfirmingEmail = (_props: HomePageProps) => {
//   // TODO: move strings to json files and translate
//   // TODO: move css to css file
//   // TODO: custom JSX vs bloom
//   // TODO: change href url basekd on env

//   console.log("_props")
//   console.log(_props)

//   return (
//     <FormLayout>
//       {
//         <FormCard header={<Heading priority={1}>The Canyon</Heading>}>
//           <a href="http://localhost:3000/listings/a0W4U00000NlolaUAB">Go to building details</a>
//         </FormCard>
//       }
//       {
//         (_props.r = "y" && (
//           <div className="flex flex-col py-px mt-4 max-w-full bg-white rounded-lg border border-solid border-zinc-200 w-[512px]">
//             <div className="flex flex-col px-20 pt-8 pb-8 text-center border-b border-solid border-zinc-200 max-md:px-5 max-md:max-w-full">
//               <div className="text-2xl text-neutral-800">Thank you for your response</div>
//               <div className="self-center mt-4 text-sm leading-4 text-black">
//                 You answered:{" "}
//                 <span className="font-bold text-black">Yes, I’m still interested</span>
//               </div>
//             </div>
//             <div className="justify-center p-8 text-base leading-6 text-sky-700 bg-slate-50 max-md:px-5 max-md:max-w-full">
//               <span className="font-bold">What to expect</span>
//               <br />
//               <ul style={{ listStyleType: "disc" }}>
//                 <li>Other applicants may be ahead of you in the original lottery order.</li>
//                 <li>
//                   Depending on how many units are still available, you might not get contacted about
//                   moving forward with your application.  
//                 </li>
//               </ul>
//               <a
//                 href="https://www.sf.gov/after-rental-housing-lottery"
//                 className="text-sky-700"
//                 target="_blank"
//               >
//                 Learn more about what happens after the housing lottery.
//               </a>
//               {/* <Link key="action-2" external href="https://www.sf.gov/after-rental-housing-lottery">
//               Learn more about what happens after the housing lottery.
//             </Link>
//             , */}
//             </div>
//           </div>
//         ))
//       }
//     </FormLayout>
//   )
// }

// export default withAppSetup(ConfirmingEmail)
