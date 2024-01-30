// polyfill for TextEncoder
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
global.TextEncoder = require("util").TextEncoder
