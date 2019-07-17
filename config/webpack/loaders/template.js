module.exports = [{
  test: /\.js$/,
  use: [ 'angular-template-url-loader' ]
},
{
  test: /\.html$/,
  use: [ 'raw-loader' ]
}]