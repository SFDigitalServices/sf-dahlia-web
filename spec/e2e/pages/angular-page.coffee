class AngularPage
  submitPage: ->
    element(By.id('submit')).click()

  extractNameParts: (fullName) ->
    nameParts = fullName.split(' ')
    firstName = nameParts[0]
    middleName = ''
    lastName = ''
    if nameParts.length == 3
      middleName = nameParts[1]
      lastName = nameParts[2]
    else
      lastName = nameParts[1]
    return { firstName, middleName, lastName }

  checkCheckbox: (checkboxId, callback) ->
    checkbox = element(By.id(checkboxId))
    checkbox.isSelected().then (selected) ->
      checkbox.click() unless selected
      callback() if callback




module.exports.AngularPage = AngularPage
