function main() {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    Logger.log("Version: " + sheet.getRange("version").getValue());
    //read sheet data
    setStatus('Reading data...');
    var dataArray = readSheetData("rSheetData");
  
    dataArray["Key"] = {};
    dataArray["Message"] = {};
  
    var urlPrefix = sheet.getRange("jirasubdomain").getValue();
    var urlIssue = "https://" + urlPrefix + ".atlassian.net/rest/api/2/issue";
    var numDataRows = sheet.getRange("numRows").getValue();
  
    setStatus('Data read');
    creds = getLogin();
    if (creds == false){
      setStatus('Login cancelled',true);
      return false
    }
    Logger.log(creds);
  
    var response = {};
    for (var i = 0; i <= numDataRows; i++)
      if (dataArray["Summary"][i] != ""){
        response = {}
        response = createIssue(urlIssue, creds, dataArray, i)
        if (response.code == 201){
           setStatus("Created issue " + (i + 1) + " of " + numDataRows)
          Logger.log(response.key);
          dataArray["Key"][i] = response.key;
          sheet.getRange("hKey").offset(1 +1, 0).setValue(response.key)
        }else{
          Logger.log(response["e"]);
          dataArray["Message"][i] = response.e;
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
  
  function setStatus(message, isError=false){
    const sheet = SpreadsheetApp.getActiveSheet();
    var status = sheet.getRange("status")
    if (isError == true){
      status.setValue(message)
      .setBackground('#f4cccc');
    }else{
      status.setValue(message)
      .setBackground('#fff2cc');
    }
  }
  