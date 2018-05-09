'user strict';

function stubAjaxRequestWithData(requestURL, data, status) {
  jasmine.Ajax.stubRequest(requestURL)
  .andReturn({
    status: status,
    responseText: data,
    contentType: 'application/json'
  });
}

function stubSuccessfulAjaxRequestWithData(requestURL, data) {
  stubAjaxRequestWithData(requestURL, data, 200);
}

function dataForFixturePath(fixturePath) {
  return withoutMockAjax(function() {
    return readFixtures(fixturePath);
  });
}

function stubAjaxRequestNoFixture(requestURL) {
  stubSuccessfulAjaxRequestWithData(requestURL, '');
}

function stubAjaxRequestWithStatus(requestURL, fixturePath, status) {
  stubAjaxRequestWithData(requestURL, dataForFixturePath(fixturePath), status);
}

var stubAjaxRequest = function(requestURL, fixturePath) {
  stubSuccessfulAjaxRequestWithData(
    requestURL,
    dataForFixturePath(fixturePath)
  );
};

var stubAngularAjaxRequest = function(httpBackend, requestURL, responseData) {
  httpBackend.when('GET', requestURL).respond(responseData);
  httpBackend.when('POST', requestURL).respond(responseData);
  httpBackend.when('PUT', requestURL).respond(responseData);
  httpBackend.when('DELETE', requestURL).respond(responseData);
};

var stubAngularAjaxErrorRequest = function(httpBackend, requestURL, responseData) {
  httpBackend.when('GET', requestURL).respond(422, responseData);
  httpBackend.when('POST', requestURL).respond(422, responseData);
};

var getPromiseResult = function(rootScope, q, promise) {
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
  // please see https://docs.angularjs.org/api/ng/service/$q#testing
  // to understand why the below line is required
  rootScope.$apply();
  return result;
};

/*
jQuery's AJAX handler normally fires the callback in a setTimeout
in order to make it occur in the next tick of the event loop. This
forces us to use `jasmine.clock().tick()` in tests. By making AJAX
synchronous, the callbacks fire immediately.
*/
$.ajaxSetup({async: false});
