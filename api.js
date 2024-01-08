function createIssue (url, credentials, dataArray, issueIndex){
    const sheet = SpreadsheetApp.getActiveSheet();
    proj = dataArray["project"][issueIndex];
    description = dataArray["description"][issueIndex];
    summary = dataArray["summary"][issueIndex];
    issueType = dataArray["type"][issueIndex];
    if (issueType ==""){
      issueType = sheet.getRange("defaultType").getValue();
      sheet.getRange("hType").offset(issueIndex + 1,0).setValue(issueType);
    }
    priority = dataArray["priority"][issueIndex];
    if (priority ==""){
      priority = sheet.getRange("defaultPriority").getValue();
      sheet.getRange("hPriority").offset(issueIndex + 1,0).setValue(priority);
    }
    var data = {}
  
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
  
  function updateIssue (url, credentials, dataArray, issueIndex){
    const sheet = SpreadsheetApp.getActiveSheet();
    url = url + dataArray["key"][issueIndex] + "?returnIssue=True";
    description = dataArray["description"][issueIndex];
    summary = dataArray["summary"][issueIndex];
    priority = dataArray["priority"][issueIndex];
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
      
      Logger.log(dataAll);
  
      var responseMap = {};
      responseMap["key"] = dataAll.key;
      responseMap["code"] = response.getResponseCode();
      return responseMap
    }catch(e){
      Logger.log("issue failed");
      responseMap["e"] = e;
      responseMap["code"] = 400;
      return responseMap
    }
  }
  
  
  //gets the user's Jira username and API key information
  function getLogin() {
    var ui = SpreadsheetApp.getUi();
  
    //get username
    var username = ui.prompt("Please enter Jira Username",ui.ButtonSet.OK_CANCEL);
    
    if (username.getResponseText().length > 0) {
      Logger.log("User provided username");
      Logger.log(username.getResponseText());
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
    var test =  username.getResponseText() + ':' + apitoken.getResponseText();
    return Utilities.base64Encode(test) 
  }
  
  
  
  
  //
  
   