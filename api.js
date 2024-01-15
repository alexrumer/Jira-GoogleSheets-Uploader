/**
 * Defines all of the fields and creates payload to be sent to the API to create the issue
 *
 * @param {string} credentials Username + token encoded in base64.
 * @param {array} dataArray Array which contains all the issue data.
 * @param {int} issueIndex Index of the issue to be created in the dataArray.
 * @return the status of the issue from sendAPIData.
 */
function createIssue (credentials, dataArray, issueIndex){
  const sheet = SpreadsheetApp.getActiveSheet();
  let proj = dataArray.project[issueIndex];
  let url = dataArray.urlIssue;
  var data = {}

  //initalize fields
  let description = dataArray.description[issueIndex];
  let summary = dataArray.summary[issueIndex];
  
  let issueType = dataArray.type[issueIndex];
  if (issueType ==""){
    issueType = dataArray.defaultType;
    sheet.getRange("hType").offset(issueIndex + 1,0).setValue(issueType);
  }
  issueType = toTitle(issueType); //convert to Proper case due to API case sensitivty
 
  let priority = dataArray.priority[issueIndex];
  if (priority ==""){
    priority = dataArray.defaultPriority;
    sheet.getRange("hPriority").offset(issueIndex + 1,0).setValue(priority);
  }
  priority = toTitle(priority);

  //build data array
  data = {
    "fields": {
      "project":{ 
          "key": proj
      },
      "priority": {
          "name": priority
      },
      "summary": summary,
      "description": description,
      "issuetype":{
          "name": issueType
      }
    }
  };

  var payload = JSON.stringify(data);

  return sendAPIData(url, credentials, "POST", payload);
}
/**
 * Defines all of the fields and creates payload to be sent to the API to update an issue.
 *
 * @param {string} credentials Username + token encoded in base64.
 * @param {array} dataArray Array which contains all the issue data.
 * @param {int} issueIndex Index of the issue to be created in the dataArray.
 * @return the status of the issue from sendAPIData.
 */
function updateIssue (credentials, dataArray, issueIndex){
  const sheet = SpreadsheetApp.getActiveSheet();
  let url = dataArray.urlIssue + dataArray["key"][issueIndex] + "?returnIssue=True";
  let description = dataArray.description[issueIndex];
  let summary = dataArray.summary[issueIndex];
  let priority = dataArray.priority[issueIndex];
  if (priority ==""){
    priority = sheet.getRange("defaultPriority").getValue();
    sheet.getRange("hPriority").offset(issueIndex + 1,0).setValue(priority);
  }
  var data = {}

  data = {
    "fields": {
      "priority": {
          "name": priority
      },
      "summary": summary,
      "description": description
    }
  };

  var payload = JSON.stringify(data);

  return sendAPIData(url, credentials, "PUT", payload);
}

/**
 * Sends payload data to the Jira API.
 *
 * @param {string} url URL of the API.
 * @param {string} credentials Username + token encoded in base64.
 * @param {string} method The HTTP method to be used (PUT, GET, POST, etc).
 * @param {array} payload Payload to be sent to the API.
 * @return The status response in the form of a map [data, code, e]. Key=Jira Key, code=HTTP respose, e=error if any.
 */
function sendAPIData(url, credentials, method="GET", payload = ""){
  try {
    var responseMap = {};
    var headers = 
      { 
        "content-type": "application/json",
        "Accept": "application/json",
        "authorization": "Basic " + credentials
      }; 
    
    var options = 
      { 
        "content-type": "application/json",
        "method": method,
        "headers": headers,
        "payload": payload
      };  

    //
    // Make the HTTP call to the JIRA API
    //
    var response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());

    var dataAll = JSON.parse(response.getContentText());

    var responseMap = {};
    responseMap["data"] = dataAll;
    responseMap["code"] = response.getResponseCode();
    return responseMap
  }catch(e){
    Logger.log("issue failed");
    responseMap["e"] = e;
    responseMap["code"] = 400;
    return responseMap
  }
}


/**
 * gets user Login info using two prompts
 * 
 * @customfunction
 * @return Returns the encoded base64 username + API token key. If error, this returns false. 
 */
function getLogin() {
  var ui = SpreadsheetApp.getUi();

  //get username
  var username = ui.prompt("Please enter Jira Username",ui.ButtonSet.OK_CANCEL);
  
  if (username.getResponseText().length > 0) {
    Logger.log("User provided username");
  } else {
    Logger.log("ERROR: User aborted username"); 
    return false;
  }

  //get API key
  var apitoken= ui.prompt("Please enter Jira API key",ui.ButtonSet.OK_CANCEL);
  
  if (apitoken.getResponseText().length > 0) {
    Logger.log("User provided API Token");
  } else {
    Logger.log("ERROR: User didn't provide key"); 
    return false;
  }

  let credentials = username.getResponseText() + ':' + apitoken.getResponseText();
  return Utilities.base64Encode(credentials);
}

/**
 * Checks if user credentials are valid
 *  
 * @param url Url of the API.
 * @param credentials Credentials to validate.
 * @customfunction
 * @return Returns true if valid, false otherwise 
 */
function isValidLogin(url, credentials){
  
  let response = sendAPIData(url, credentials, "GET")

  if (response.data.total > 0){
    Logger.log("login is valid");
    return true;
  }else {
    return false;
  }

} 

