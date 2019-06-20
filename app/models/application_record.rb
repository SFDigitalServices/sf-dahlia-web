# Superclass for all app models to inherit from. Required in Rails 5.
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
end
