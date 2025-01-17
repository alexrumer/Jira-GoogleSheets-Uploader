/**
 * Sets a range to hyperlink with a Jira key as the text
 *
 * @param {range} range Range where the hyperlink will go.
 * @param {string} jiraKey Jira key text shown in the cell (ex: ABC-123)
 * @param {baseurl} baseurl URL of the jira instance URL.
 * @customfunction

 */
function setCellURLKey(range, jiraKey, baseurl) {
    var richValue = SpreadsheetApp.newRichTextValue()
     .setText(jiraKey)
     .setLinkUrl(baseurl + jiraKey)
     .build();
   range.setRichTextValue(richValue); 
  }
  
  
  /**
   * Sets a string to Proper/Title case. From: https://stackoverflow.com/questions/23439300/converting-string-to-proper-title-case-in-google-apps-script
   *
   * @param {str} str String to be converted to Proper case
   * @return Proper case function
   * @customfunction
   */
  function toTitle(str) {
      return str.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0)
              .toUpperCase() + txt.substr(1)
              .toLowerCase();
      });
  }
  // from https://webapps.stackexchange.com/questions/93305/how-to-find-url-of-the-current-sheet
  function getSheetUrl(sht) {
    var ss = SpreadsheetApp.getActive();
  
    var SHT = sht ? sht : ss.getActiveSheet();
  
    var url = (ss.getUrl() + '#gid=' + SHT.getSheetId());
  
    return url;
  }