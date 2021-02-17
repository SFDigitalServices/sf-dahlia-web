
module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer")],
}


// module.exports = {
//   plugins: [
//     require('postcss-import'),
//     require('postcss-flexbugs-fixes'),
//     require('postcss-preset-env')({
//       autoprefixer: {
//         flexbox: 'no-2009'
//       },
//       stage: 3
//     })
//   ]
// }

// module.exports = {
//   plugins: [
//     require("tailwindcss")("tailwind.config.js"),
//     require('postcss-import'),
//     require('postcss-flexbugs-fixes'),
//     require('postcss-nested'),
//     require('postcss-preset-env')({
//       autoprefixer: {
//         flexbox: 'no-2009'
//       },
//       stage: 3
//     }),
//     require("autoprefixer")
//   ]
// }
