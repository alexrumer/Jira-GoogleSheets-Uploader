function onOpen(){
  createMenu()
};
function createMenu() {
  const sheet = SpreadsheetApp.getActiveSheet();
    let showhideColumnsMenuItem = "Show Advanced Columns";
    if (sheet.getRange("cfgShowAdvanced").getValue()){
        showhideColumnsMenuItem = "Hide Advanced Columns";
    }
   SpreadsheetApp.getUi().createMenu("⚙️ Jira Uploader")
    .addItem("Send Data to Jira", "CreateIssues")
    .addSeparator()
    .addItem("Reset Sheet (Clear Issues)", "clearSheetButton")
    .addSeparator()
    .addItem("Sync Projects and Users", "getUserAndProjects")
    .addItem(showhideColumnsMenuItem, "hideAdvColumns")
    .addToUi();
}

function CreateIssues() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  Logger.log("Version: " + sheet.getRange("version").getValue());
  //read sheet data
  setStatus('Reading data...');
  var dataArray = readSheetData("rSheetData");
  
  setStatus('Data read');
  let creds = getLogin();
  if (creds == false){
    setStatus('Login cancelled',true);
    return false
  }

  //check if login is correct
  if (!isValidLogin(dataArray.urlProject,creds)){
    setStatus("Credentials are invalid!",true);
    return false;
  }
  //login is ok, proceed with clearing old data and creating issues
  const startTime = Date.now();
  let createdIssues=0;
  //clear status data
  clearData(false);

  var response = [];
  for (var i = 0; i <= dataArray.numDataRows; i++)

    //create issue
    if (dataArray.summary[i] != "" && dataArray.skip[i] == false ){
      response = {}
      response = createIssue(creds, dataArray, i)
      if (response.code == 201){
         setStatus("Created issue " + (createdIssues + 1) + " of " + dataArray.numIssues)
        Logger.log(response.key);
        dataArray["key"][i] = response.key;
        sheet.getRange("hMessage").offset(i + 1, 0).setValue("201: Created!");
        sheet.getRange("hSkip").offset(i + 1, 0).setValue("TRUE");
        setCellURLKey(sheet.getRange("hKey").offset(i +1, 0), response.data.key, dataArray.urlHTTPIssue)
        createdIssues++;
      }else{
        Logger.log(response["e"]);
        dataArray.message[i] = response.e;
        sheet.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
      }
     //update issue if it exists
    }else if (dataArray.summary[i] != "" && dataArray.skip[i] == true && dataArray.key[i] != "" ){
      response = {}
      response = updateIssue(creds, dataArray, i)
      if (response.code == 200){
         setStatus("Updated issue " + (createdIssues + 1) + " of " + dataArray.numIssues)
         sheet.getRange("hMessage").offset(i +1, 0).setValue("200: Updated!");
         createdIssues++;
      }else{
        Logger.log(response["e"]);
        dataArray["message"][i] = response["e"];
        sheet.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
      }
    }
    const endTime = Date.now();
    const totTime =  Math.round(((endTime - startTime) * 0.001));
    setStatus("Done creating " + createdIssues + "/" + dataArray.numIssues + " issues in " + totTime +"sec.");
}

/**
 * Reads the table data from the sheet and returns map of arrays with headers
 *
 * @param {range} NamedDataRange Range where the data to be read is stored, including headers
 * @@return a dataMap with headers as keys and arrays as values. 
 */
function readSheetData (NamedDataRange = "rSheetData"){
  
  const sheet = SpreadsheetApp.getActiveSheet();
  var sData = sheet.getRange(NamedDataRange).getValues();

  // Extract headers from https://stackoverflow.com/questions/62186607/how-to-convert-table-data-to-an-object-and-have-headers-as-keys
  var headers = sData[0]; //header row
  headers = headers.map(v => v.toString().toLowerCase());
  var body = sData.slice(1); //rest of the data
  var dataMap = {};
  var i = 0;
  // For each header
  headers.forEach(function(col){''
    // Create an empty list for the values
    dataMap[col] = [];
    // For every row in the body assign the values to their keys 
    body.map(row => dataMap[col].push(row[i]));
    i++;
  })
  
  //set defaults 
  dataMap["defaultPriority"] = sheet.getRange("cfgDefaultIssuePriority").getValue()
  dataMap["defaultType"] = sheet.getRange("cfgDefaultIssueType").getValue();
  dataMap["urlSubDomain"] = sheet.getRange("cfgJiraSubdomain").getValue();
  dataMap["urlHTTPIssue"] = dataMap.urlSubDomain + ".atlassian.net/browse/";
  dataMap["urlIssue"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/2/issue/";
  dataMap["urlProject"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/2/project/search";
  dataMap["urlUsers"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/3/user/search?query=*&maxResults=2500";
  dataMap["numDataRows"] = sheet.getRange("numRows").getValue();
  dataMap["numIssues"] = sheet.getRange("numIssues").getValue();
  //dataMap['cfParent'] = sheet.getRange("cfParent").getValue();

  return dataMap;
}


/**
 * Display the status message in the status cell, and sets it to the appropriate color. 
 *
 * @param {string} message Message to be shown. If message is "". then cell color will be cleared.
 * @param {bool} isError If true red color will be used, otherwise green color will be used.
 * @customfunction
 */
function setStatus(message="", isError=false){
  const sheet = SpreadsheetApp.getActiveSheet();
  let status = sheet.getRange("status");
  if (isError == true){
    status.setValue(message)
    .setBackground('#f4cccc'); //red
  }else if(message ==""){
    status.setBackground(null) //clear cell color as there is no message
    .setValue(message);
  }else{ 
    status.setValue(message)
    .setBackground('#fff2cc');
  }
}

/**
 * Sets the sheet to the default state or just clears state data.
 *
 * @param {bool} userClear default false. true=clear all user data. false=clear only state data.
 * @customfunction
 */
function clearData(userClear=false){
  const sheet = SpreadsheetApp.getActiveSheet();
  if (userClear){
    sheet.getRange("UserData").clearContent();
  }
  sheet.getRange("colMessage").clearContent();
  setStatus();
}

//function called by the user on the sheet via button to clear sheet
  function clearSheetButton(){
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'Are you sure you clear the sheet?',
      ui.ButtonSet.YES_NO
  );
  if (response == ui.Button.YES) {
    clearData(true);
  }
  }

function getUserAndProjects(){
  const sheet = SpreadsheetApp.getActiveSheet();
  
  sheet.getRange("Projects").clearContent();
  sheet.getRange("Users").clearContent();
  
  setStatus('Reading data...');
  
  var dataArray = readSheetData("rSheetData");
  setStatus('Data read');
  
  let creds = getLogin();
  if (creds == false){
    setStatus('Login cancelled',true);
    return false
  }

  //check if login is correct
  if (!isValidLogin(dataArray.urlProject,creds)){
    setStatus("Credentials are invalid!",true);
    return false;
  }
  setStatus("Downloading Users...")
  let users = getUsers(dataArray.urlUsers,creds)
  sheet.getRange("hDisplayName").offset(1,0,users.name.length,1).setValues(users.name);
  sheet.getRange("hUserID").offset(1,0,users.id.length,1).setValues(users.id);

  setStatus("Downloading Projects...")
  let projects = getProjects(dataArray.urlProject,creds);

  //write projects to the sheet
  sheet.getRange("hProjectKey").offset(1,0,projects.key.length,1).setValues(projects.key);
  sheet.getRange("hProjectName").offset(1,0,projects.key.length,1).setValues(projects.name);
   setStatus((projects.key.length +" Projects downloaded!"))
}  


function hideAdvColumns(){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Get the active sheet
  const colRange = sheet.getRange("cfgShowAdvanced");
  const showCols = colRange.getValue();
  const targetRow = sheet.getRange("rHeaders").getRow()-1; // get the row of the hide marker
  const dataRange = sheet.getRange(targetRow, 1, 1, sheet.getLastColumn()); // Get the target row range
  const rowValues = dataRange.getValues()[0]; // Get the values in the target row
  
  // Loop through the columns and hide those with "hide" in the target row
  
  if (showCols){
    for (let col = 0; col < rowValues.length; col++) {
      if (rowValues[col].toLowerCase() === "x") {
        sheet.hideColumns(col + 1); // Column index is 1-based
      };
    colRange.setValue(false); // 
    };
  }else{
    for (let col = 0; col < rowValues.length; col++) {
      if (rowValues[col].toLowerCase() === "x") {
        sheet.showColumns(col + 1); // Column index is 1-based
      };
    };
    colRange.setValue(true);
  }
  createMenu(); // update menu item
}



