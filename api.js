/**
 * Defines all of the fields and creates payload to be sent to the API to create the issue
 *
 * @param {string} credentials Username + token encoded in base64.
 * @param {array} dataArray Array which contains all the issue data.
 * @param {int} issueIndex Index of the issue to be created in the dataArray.
 * @return the status of the issue from sendAPIData.
 */
function createIssue (credentials, dataArray, issueIndex){
  const sh = SpreadsheetApp.getActiveSheet();
  let proj = dataArray.project[issueIndex];
  let url = dataArray.urlIssue;
  var data = {}

  //initalize fields
  let description = dataArray.description[issueIndex];
  let summary = dataArray.summary[issueIndex];
  let issueType = dataArray.type[issueIndex];
 
  if (issueType ==""){
    issueType = dataArray.defaultType; //set default issue type if one is not provided
    sh.getRange("hType").offset(issueIndex + 1,0).setValue(issueType);
  }
  issueType = toTitle(issueType); //convert to Proper case due to API case sensitivty
 
  let priority = dataArray.priority[issueIndex];
  if (priority ==""){
    priority = dataArray.defaultPriority; //set default issue priority if one is not provided
    sh.getRange("hPriority").offset(issueIndex + 1,0).setValue(priority);
  }
  priority = toTitle(priority);
  let parentKey = dataArray.parent[issueIndex].toUpperCase();
  if (parentKey == ""){parentKey = null};
  let assignee = dataArray.user[issueIndex];
  if (assignee == ""){assignee = null};

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
      "assignee": {
          "id": assignee},
      "description": description,
      "issuetype":{
          "name": issueType
      },
      "parent": {
        "key": parentKey
      }
    }
  };
  
  //data.fields[cfParent]=parentKey;
  //

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
  const sh = SpreadsheetApp.getActiveSheet();
  const url = dataArray.urlIssue + dataArray["key"][issueIndex] + "?returnIssue=True";
  const description = dataArray.description[issueIndex];
  const summary = dataArray.summary[issueIndex];
  let priority = dataArray.priority[issueIndex];
  if (priority ==""){
    priority = sh.getRange("defaultPriority").getValue();
    sh.getRange("hPriority").offset(issueIndex + 1,0).setValue(priority);
  }
  let parentKey = dataArray.parent[issueIndex].toUpperCase();
  if (parentKey == ""){parentKey = null};
  let assginee = dataArray.user[issueIndex];
  if (assginee == ""){assginee = null};
  
  var data = {};

  data = {
    "fields": {
      "priority": {
        "name": priority
      },
      "summary": summary,
      "assignee": {
        "id": assginee
      },
      "description": description,
      "parent": {
        "key": parentKey
      }
    }
  }
   
  var payload = JSON.stringify(data);

  return sendAPIData(url, credentials, "PUT", payload);
}
/**
 * Defines all of the fields and creates payload to be sent to the API to add links to an issue
 *
 * @param {string} credentials Username + token encoded in base64.
 * @param {array} dataArray Array which contains all the issue data.
 * @param {int} issueIndex Index of the issue to be created in the dataArray.
 * @return the status of the issue from sendAPIData.
 */
function addIssueLinks (credentials, dataArray, issueIndex){
  const sheet = SpreadsheetApp.getActiveSheet();
  const url = dataArray.urlIssue + dataArray.key[issueIndex] + "?returnIssue=True";

  //issue links
  let linkName = dataArray.issuelinkname[issueIndex];
  let linkIn = dataArray.issuelinkin[issueIndex];
  let linkOut = dataArray.issuelinkout[issueIndex];
  let outwardIssue =dataArray.key[dataArray.issuelink[issueIndex] - 1];
  
  var data = {};

  data = {
      "update":{
        "issuelinks":[
          {
            "add":{
              "type":{
                "name": linkName,
                  "inward":linkIn,
                  "outward":linkOut,
              },
              "outwardIssue":{
                "key":outwardIssue
              }
            }
          }
        ]
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
 * @return The status response in the form of a map [key, code, e]. Key=Jira Key, code=HTTP respose, e=error if any.
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
 * Outputs an array of Jira projects
 *
 * @param {string} projectURL Project API URL.
 * @param {string} credentials Username + token encoded in base64.
 * @return array of the projects.
 */
function getProjects(projectURL, credentials){

  //get number of projects
    let maxpage = 50;
    let start = 0;
    let projects = [];
    let i = 0;
    let urlpage = "";
    projects["key"] = [];
    projects["name"] = [];

    let response = sendAPIData(projectURL, credentials, "GET");
    total = response.data.total;
    for (start=0; start <total; start = start + maxpage){
      response = null;
      urlpage = projectURL + "?startAt=" + start + "&maxResults=" + maxpage;
      response = sendAPIData(urlpage, credentials, "GET")
      for(i=0; i < response.data.values.length; i++){
        projects.key.push([response.data.values[i].key]);
        projects.name.push([response.data.values[i].name]);
      }
    }
    
  return projects;
}
/**
 * Outputs an array of active Jira users
 *
 * @param {string} userURL API URL for users.
 * @param {string} credentials Username + token encoded in base64.
 * @return array of users.
 */
function getUsers(userURL, credentials){
  let response = sendAPIData(userURL, credentials, "GET")
  
  let users = [];
  users["id"] = [];
  users["name"] = [];
  for (i=0; i <response.data.length; i++){
    //filter out app and system accounts
    if (response.data[i].accountType == "atlassian"){
      users.id.push([response.data[i].accountId]);
      users.name.push([response.data[i].displayName]);
    }
  }

  return users;
}

/**
 * gets user Login info using two prompts
 * 
 * @customfunction
 * @return Returns the encoded base64 username + API token key. If error, this returns false. 
 */
function getLogin() {
  var ui = SpreadsheetApp.getUi();
  const sh = SpreadsheetApp.getActiveSheet(); 
  let prop =  PropertiesService.getUserProperties();
  let username = "";

  //init property
  if (prop.getProperty("username") == null ){
    prop.setProperty("username","")
    }

  if(sh.getRange("askforUser").getValue() || prop.getProperty("username") == ""){
   //user name is not yet saved or 'ask every time' is selected
    var uname = ui.prompt("Please enter Jira Username",ui.ButtonSet.OK_CANCEL);
    if (uname.getResponseText().length > 0) {
      Logger.log("User provided username");
      username = uname.getResponseText();
      prop.setProperty("username",username);
    } else {
      Logger.log("ERROR: User aborted username"); 
      return false;
    }  
  }else{
    username = prop.getProperty("username");
  }

  //get API key
  var apitoken= ui.prompt("Please enter Jira API key",ui.ButtonSet.OK_CANCEL);
  
  if (apitoken.getResponseText().length > 0) {
    Logger.log("User provided API Token");
  } else {
    Logger.log("ERROR: User didn't provide key"); 
    return false;
  }

  let credentials = username + ':' + apitoken.getResponseText();
  return Utilities.base64Encode(credentials);
}

/**
 * Checks if user credentials are valid
 *  
 * @param projectURL Project API URL.
 * @param credentials Credentials to validate.
 * @customfunction
 * @return Returns true if valid, false otherwise 
 */
function isValidLogin(projectURL, credentials){
  
  let response = sendAPIData(projectURL, credentials, "GET")
   let prop =  PropertiesService.getUserProperties();
  //valid users return more than one project
  if (response.data.total > 0){
    Logger.log("login is valid");
    return true;
  }else {
    prop.setProperty("username", "");
    return false;
  }

} 