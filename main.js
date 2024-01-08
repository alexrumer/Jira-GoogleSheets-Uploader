function main() {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    Logger.log("Version: " + sheet.getRange("version").getValue());
    //read sheet data
    setStatus('Reading data...');
    var dataArray = readSheetData("rSheetData");
  
    var urlSubDomain = sheet.getRange("jirasubdomain").getValue();
    var urlHTTPIssue = "https://" + urlSubDomain + ".atlassian.net/browse/"
    var urlIssue = "https://" + urlSubDomain + ".atlassian.net/rest/api/2/issue/";
    var numDataRows = sheet.getRange("numRows").getValue();
  
    setStatus('Data read');
    creds = getLogin();
    if (creds == false){
      setStatus('Login cancelled',true);
      return false
    }
  
    clearData(false);
  
    var response = {};
    for (var i = 0; i <= numDataRows; i++)
  
      
      if (dataArray["summary"][i] != "" && dataArray["skip"][i] == false ){
        response = {}
        response = createIssue(urlIssue, creds, dataArray, i)
        if (response.code == 201){
           setStatus("Created issue " + (i + 1) + " of " + numDataRows)
          Logger.log(response.key);
          dataArray["key"][i] = response.key;
          sheet.getRange("hMessage").offset(i + 1, 0).setValue("Created!");
          sheet.getRange("hSkip").offset(i + 1, 0).setValue("TRUE");
          setCellURL(sheet.getRange("hKey").offset(i +1, 0), response.key, urlHTTPIssue)
        }else{
          Logger.log(response["e"]);
          dataArray["message"][i] = response.e;
          sheet.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
        }
       
      }else if (dataArray["summary"][i] != "" && dataArray["skip"][i] == true && dataArray["key"][i] != "" ){
        response = {}
        response = updateIssue(urlIssue, creds, dataArray, i)
        if (response.code == 200){
           setStatus("Updated issue " + (i + 1) + " of " + numDataRows)
           sheet.getRange("hMessage").offset(i +1, 0).setValue("Updated!");
        }else{
          Logger.log(response["e"]);
          dataArray["message"][i] = response["e"];
          sheet.getRange("hMessage").offset(i + 1, 0).setValue(response.e)
        }
      }
  
      setStatus("Done creating issues");
  
  }
  
  //reads the table data from the sheet and returns map of arrays with headers
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
    return dataMap;
  }
  
  function setStatus(message="", isError=false){
    const sheet = SpreadsheetApp.getActiveSheet();
    var status = sheet.getRange("status")
    if (isError == true){
      status.setValue(message)
      .setBackground('#f4cccc');
    }else if(message ==""){
      status.clearFormat()
      .clearContent();
    }else{
      status.setValue(message)
      .setBackground('#fff2cc');
    }
  }
  
  function clearData(userClear=false){
    const sheet = SpreadsheetApp.getActiveSheet();
    if (userClear){
      sheet.getRange("UserData").clearContent();
    }
    sheet.getRange("colMessage").clearContent();
    setStatus();
  }
  function clearSheetButton(){
    clearData(true);
  }
  