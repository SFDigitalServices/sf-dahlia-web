const {environment} = require("@rails/webpacker")
const dotenv = require("dotenv")
const webpack = require("webpack")

const dotenvFiles = [".env"]
dotenvFiles.forEach((dotenvFile) => {
    dotenv.config({path: dotenvFile, silent: true})
})

environment.plugins.prepend(
    "Environment",
    new webpack.DefinePlugin({
        "process.env": {
            COVID_UPDATE: JSON.stringify(process.env.COVID_UPDATE),
            DIRECTORY_PAGE_REACT: JSON.stringify(process.env.DIRECTORY_PAGE_REACT),
            GOOGLE_PLACES_KEY: JSON.stringify(process.env.GOOGLE_PLACES_KEY),
            RESEARCH_FORM_URL: JSON.stringify(process.env.RESEARCH_FORM_URL),
            SHOW_RESEARCH_BANNER: process.env.SHOW_RESEARCH_BANNER,
            TOP_MESSAGE: JSON.stringify(process.env.TOP_MESSAGE),
            TOP_MESSAGE_TYPE: JSON.stringify(process.env.TOP_MESSAGE_TYPE),
            TOP_MESSAGE_INVERTED: JSON.stringify(process.env.TOP_MESSAGE_INVERTED)
        },
    })
)

const babel = require("./loaders/babel")
const sass = require("./loaders/sass")
environment.loaders.prepend("babel", babel)
environment.loaders.append("sass", sass)

environment.loaders.keys().forEach((loaderName) => {
    const loader = environment.loaders.get(loaderName)
    loader.use.forEach((loaderConfig) => {
        if (loaderConfig.options && loaderConfig.options.config) {
            loaderConfig.options.postcssOptions = loaderConfig.options.config
            delete loaderConfig.options.config
        }
    })
})

module.exports = environment
