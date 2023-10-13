# Load testing with JMeter

We use [JMeter](https://jmeter.apache.org/) to stress test our Salesforce API when we want to test how code updates behave with production-level traffic.

## Getting started
1. Follow the instructions on the JMeter site to [download and install JMeter](http://jmeter.apache.org/usermanual/get-started.html#install)
1. Verify that you can run the JMeter GUI:
  - cd into the `apache-jmeter-5.2.1` directory whereve you've unzipped it
  - run `./bin/jmeter`


## Running the Sharing Stress Test file

### Get a valid auth token
1. Using e.g. Postman, setup a POST request to the ADMIN_TOKEN_URL (https://sfhousing--full.my.salesforce.com/services/oauth2/token)
1. Update the Body to have the following keys (values are in the .env file):
  ```
  grant_type:password
  client_id:{{SALESFORCE_CLIENT_ID}}
  client_secret:{{SALESFORCE_CLIENT_SECRET}}
  username:{{SALESFORCE_USERNAME}}
  password:{{SALESFORCE_PASSWORD}}{{SALESFORCE_SECURITY_TOKEN}}
  ```
1. Send the request
1. The auth_token should be included in the response body

## To run the Sharing stress test plan located in this directory as-is:
1. Open the Sharing_Stress_Test_Plan.jmx file in the JMeter GUI
1. cd into the `apache-jmeter-5.2.1` directory where you unzipped the file
1. Export your oauth token you fetched into an env var: `export OAUTH_TOKEN='[auth_token from salesforce]'`
1. Run `./bin/jmeter.sh -n -t [Path to sf-dahlia-web]/load_testing/Sharing_Stress_Test_Plan.jmx -l stress_test_results/summary.jtl -Joauth_token=$OAUTH_TOKEN`

## To update the stress test
1. Open up the Sharing_Stress_Test_Plan.jmx file in the JMeter GUI
1. Make edits as necessary
1. To test edits, update the thread count and loop count under "Stess Test Application Submission" to be 1-2 each, then run using the green play button. This is becuase the GUI should only be used for small numbers of requests. If you are running via the GUI you may need to manually enter the oauth token under "HTTP Header Manager" > "Authorization"
1. When committing updates, make sure that you do not commit the auth_token with your changes.

### Sample updates
1. To update the total number of requests being made, update the "Number of Threads" and "Loop Count" under the top level "Stress Test Application Submission"
1. To update the request/minute througput, update the "Target Throughput" under the "Constant Throughput Timer". This number controls the total request throughput, so to find the equivalent for applications submitted / minute, divide by 4.
1. To update the base URL for requests, update the url under "Server Name or IP" under "HTTP Requests Defaults"

## To run the JMeter test for stress testing Multiple Listing Image performance:
1. Open the DAHLIA-Full-Listing-Images.jmx file in the JMeter GUI
2. Run the test and view the Graph Results