function main() {
  const sh = SpreadsheetApp.getActiveSheet();
  
  Logger.log("Version: " + sh.getRange("version").getValue());
  //read sheet data
  setStatus('Reading data...');
  var dataArray = readSheetData("rSheetData");
  
  if (dataArray.urlSubDomain==""){
    setStatus("Please enter a Jira subdomain on the Config tab",true);
    return false;
  
  }

  setStatus('Data read');
  let creds = getLogin();
  if (creds == false){
    setStatus('Login cancelled',true);
    return false;
  }

  //check if login is correct
  if (!isValidLogin(dataArray.urlProject,creds)){
    setStatus("Credentials are invalid!",true);
    return false;
  }
  //login is ok, proceed with clearing old data and creating issues
  const startTime = Date.now();
  let createdIssues = 0;
  let createdLinks = 0;
  //clear status data
  clearData(false);

  var response = [];
  for (var i = 0; i <= dataArray.numDataRows; i++){

    //create issue
    if (dataArray.summary[i] != "" && !dataArray.skip[i] ){ //
      response = {}
      response = createIssue(creds, dataArray, i)
      if (response.code == 201){
        createdIssues++;
        setStatus("Created issue " + (createdIssues) + " of " + dataArray.numIssues + "...")
        //Logger.log(response.data.key);
        dataArray.key[i] = response.data.key;
        sh.getRange("hMessage").offset(i + 1, 0).setValue("201: Created!");
        sh.getRange("hSkip").offset(i + 1, 0).setValue("TRUE"); //update checkbox so that the issue does not get recreated
        setCellURLKey(sh.getRange("hKey").offset(i +1, 0), response.data.key, dataArray.urlHTTPIssue)
        
      }else{
        Logger.log(response["e"]);
        dataArray.message[i] = response.e;
        sh.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
      }
     //update issue if it exists
    }else if (dataArray.summary[i] != "" && dataArray.skip[i] && dataArray.key[i] != "" ){
      response = {}
      response = updateIssue(creds, dataArray, i)
      if (response.code == 200){
         createdIssues++;
         setStatus("Updated issue " + (createdIssues) + " of " + dataArray.numIssues + "...")
         sh.getRange("hMessage").offset(i +1, 0).setValue("200: Updated!");
      }else{
        Logger.log(response["e"]);
        dataArray.message[i] = response["e"];
        sh.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
      }
    }
  };
  //check if links need to be added for the issues already created. Links need to be added once the key is known.
  for (var i = 0; i <= dataArray.numDataRows; i++){
    if (dataArray.issuelink[i] !=""){
      response = {}
      response = addIssueLinks(creds, dataArray, i)
      if (response.code == 200){
         createdLinks++;
         setStatus("Added issue link to" + (createdLinks) + " of " + dataArray.numLinks + "...")
         sh.getRange("hMessage").offset(i +1, 0).setValue("200: Updated link!");
      }else{
        Logger.log(response["e"]);
        dataArray.message[i] = response["e"];
        sh.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
      }
    };
  };
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
  
  const sh = SpreadsheetApp.getActiveSheet();
  var sData = sh.getRange(NamedDataRange).getValues();

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
  dataMap["defaultPriority"] = sh.getRange("cfgDefaultIssuePriority").getValue()
  dataMap["defaultType"] = sh.getRange("cfgDefaultIssueType").getValue();
  dataMap["urlSubDomain"] = sh.getRange("cfgJiraSubdomain").getValue();
  dataMap["urlHTTPIssue"] = dataMap.urlSubDomain + ".atlassian.net/browse/";
  dataMap["urlIssue"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/2/issue/";
  dataMap["urlProject"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/2/project/search";
  dataMap["urlUsers"] = "https://" + dataMap.urlSubDomain + ".atlassian.net/rest/api/3/user/search?query=*&maxResults=2500";
  dataMap["numDataRows"] = sh.getRange("numRows").getValue();
  dataMap["numIssues"] = sh.getRange("numIssues").getValue();
  dataMap["numLinks"] = sh.getRange("numLinks").getValue();

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
  const sh = SpreadsheetApp.getActiveSheet();
  const status = sh.getRange("status");
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
  Logger.log(message); //add message to the logger as welk
}

/**
 * Sets the sheet to the default state or just clears state data.
 *
 * @param {bool} userClear default false. true=clear all user data. false=clear only state data.
 * @customfunction
 */
function clearData(userClear=false){
  const sh = SpreadsheetApp.getActiveSheet();
  if (userClear){
    sh.getRange("UserData").clearContent();
  }
  sh.getRange("colMessage").clearContent();

  sh.getRange('rSkip').setDataValidation(SpreadsheetApp.newDataValidation()
  .setAllowInvalid(true)
  .requireCheckbox()
  .build());

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
    showAdvColumns(true);
  }
  }

function getUserAndProjects(){
  const sh = SpreadsheetApp.getActiveSheet();
  
  sh.getRange("Projects").clearContent();
  sh.getRange("Users").clearContent();
  
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
  sh.getRange("hDisplayName").offset(1,0,users.name.length,1).setValues(users.name);
  sh.getRange("hUserID").offset(1,0,users.id.length,1).setValues(users.id);

  setStatus("Downloading Projects...")
  let projects = getProjects(dataArray.urlProject,creds);

  //write projects to the sheet
  sh.getRange("hProjectKey").offset(1,0,projects.key.length,1).setValues(projects.key);
  sh.getRange("hProjectName").offset(1,0,projects.key.length,1).setValues(projects.name);
   setStatus((projects.key.length +" Projects downloaded!"))
}  


function showAdvColumns(showOverride = false){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); // Get the active sheet
  const colRange = sheet.getRange("cfgShowAdvanced");
  let showCols = colRange.getValue();
  if (showOverride){showCols=true}
  const targetRow = sheet.getRange("rHeaders").getRow()-1; // get the row of the hide marker
  const dataRange = sheet.getRange(targetRow, 1, 1, sheet.getLastColumn()); // Get the target row range
  const rowValues = dataRange.getValues()[0]; // Get the values in the target row
  
  // Loop through the columns and hide those with "hide" in the target row
  
  if (showCols){
    for (let col = 0; col < rowValues.length; col++) {
      if (rowValues[col].toLowerCase() === "hide") {
        sheet.hideColumns(col + 1); // Column index is 1-based
      };
    colRange.setValue(false); // 
    };
  }else{
    for (let col = 0; col < rowValues.length; col++) {
      if (rowValues[col].toLowerCase() === "hide") {
        sheet.showColumns(col + 1); // Column index is 1-based
      };
    };
    colRange.setValue(true);
  }
  createMenu(); // update menu item
}

//load menu
function onOpen(){
  createMenu()
};

//define menu
function createMenu() {
  const sheet = SpreadsheetApp.getActiveSheet();
    let showhideColumnsMenuItem = "Show Advanced Columns";
    if (sheet.getRange("cfgShowAdvanced").getValue()){
        showhideColumnsMenuItem = "Hide Advanced Columns";
    }
   SpreadsheetApp.getUi().createMenu("⚙️ Jira Uploader")
    .addItem("Send Data to Jira", "main")
    .addSeparator()
    .addItem("Reset Sheet (Clear Issues)", "clearSheetButton")
    .addSeparator()
    .addItem("Sync Projects and Users", "getUserAndProjects")
    .addItem(showhideColumnsMenuItem, "showAdvColumns")
    .addToUi();
}

