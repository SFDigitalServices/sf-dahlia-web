//= require angular-mocks

var getPromiseResult = function(rootScope, q, promise) {
  // please see https://docs.angularjs.org/api/ng/service/$q#testing
  // for background on testing promises in Angular
  var result = {
    status: null,
    value: null
  };
  var deferred = q.defer();
  deferred.promise.then(
    function(value) { result.status = 'success'; result.value = value; },
    function(value) { result.status = 'error'; result.value = value; }
  );
  deferred.resolve(promise);
  rootScope.$apply();
  return result;
};
