# Jira-GoogleSheets-Uploader

## Introduction
This is a very early version of the Google Sheets Jira Uploader tool. It allows a user to create multiple issues in different Jira project in a single operation. 


Access it here [Google Sheet](https://docs.google.com/spreadsheets/d/1RtZcW4pzUm8hLmnPJAOrrSI4H0GZXysDM8PDEKd4wME/edit#gid=1564783105).

## Instructions
### Get API Key
In order to use this tool, you will need to get an [API token from Attlassian](https://id.atlassian.com/manage-profile/security/api-tokens) and follow along [their guide](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/). Save this key in the password manager of your choice and rotate it often. 

### Configuration
Open the sheet above and navigate to the Config tab
 1. Save as a copy of the sheet for your use. 
 2. Add your Jira domain prefix (https://PREFIX.attlassian.net/)
 3. Set up your available and default issue type and priority levels
![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/9c9d6559-db79-4e07-96f6-4ea6d03d1ba3)

### Usage
1. Add all of your required issue data. Project Key and Summary are required. Issue Type and Priority default values will be used if none are provided.

![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/b6275564-fa29-46f3-9f70-6f0569d60d45)

2. Once the data is filled out, click on *Send to Jira*
3. If using the sheet for the first time, you will need to review and approve the authorization
![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/2f7489d5-50ee-40e7-94c8-50c48e7e957a)

4. Provide your Atlassian account name
5. Provide your API token generated above.
6. The issues will be created one by one and the results shown

![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/2f7490b3-01c9-41ad-98fe-cdcc761293cf)

7. You can resubmit the data again. Issues checked as *Skip* will be updated (Summmry, Description, and Priority only), while unchecked issues will be created. 
   


## Troubleshooting
(This is under coonstruction)


