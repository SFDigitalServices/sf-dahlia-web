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
  httpBackend.when('DELETE', requestURL).respond(responseData);
};

var stubAngularAjaxErrorRequest = function(httpBackend, requestURL, responseData) {
  httpBackend.when('GET', requestURL).respond(422, responseData);
  httpBackend.when('POST', requestURL).respond(422, responseData);
};

/*
jQuery's AJAX handler normally fires the callback in a setTimeout
in order to make it occur in the next tick of the event loop. This
forces us to use `jasmine.clock().tick()` in tests. By making AJAX
synchronous, the callbacks fire immediately.
*/
$.ajaxSetup({async: false});
