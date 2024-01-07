function createIssue (url, credentials, dataArray, issueIndex){


    proj = dataArray["Project"][issueIndex];
    description = dataArray["Description"][issueIndex];
    summary = dataArray["Summary"][issueIndex];
    type = dataArray["Type"][issueIndex];
    priority = dataArray["Priority"][issueIndex];
    
  
    var data = {
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
            "name": type
         }
      }
    };
  
    var payload = JSON.stringify(data);
  
    return sendAPIData(url, credentials, "POST", payload);
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
      //
      // Parse the JSON response to use the Issue Key returned by the API in the email
      //
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
  
   