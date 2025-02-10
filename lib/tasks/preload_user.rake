namespace :preload do
  task user: :environment do
    user = User.find_or_create_by(email: 'test@test.com') do |u|
      u.password = 'abcd1234'
      u.password_confirmation = 'abcd1234'
    end

    raise 'Failed to create user' unless user.persisted?

    salesforce_contact = Force::AccountService.create_or_update(
      webAppID: user.id,
      email: user.email,
      firstName: 'Test',
      lastName: 'User',
      DOB: '1990-01-01',
    )

    if salesforce_contact && salesforce_contact['contactId'].present?
      user.update(salesforce_contact_id: salesforce_contact['contactId'])
      user.confirm unless user.confirmed?
    else
      user.destroy
      raise 'Failed to sync with Salesforce'
    end
  end
end
