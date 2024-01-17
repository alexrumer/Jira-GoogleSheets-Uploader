# Jira-GoogleSheets-Uploader

## Introduction
This is an early version of the Google Sheets Jira Uploader tool. It allows a user to create multiple issues in different Jira project in a single operation. 

Access it here [Google Sheet](https://docs.google.com/spreadsheets/d/18Z0NzKmpsslgK8S6UUuGojubZBny0_C3KU7Lp9foPpM/edit#gid=1564783105).

## Instructions
### Get API Key
In order to use this tool, you will need to get an [API token from Attlassian](https://id.atlassian.com/manage-profile/security/api-tokens) and follow along [their guide](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/). Save this key in the password manager of your choice and rotate it often. 

### Configuration
Open the sheet above and navigate to the Config tab
 1. Save as a copy of the sheet for your use. 
 2. Add your Jira domain prefix (https://PREFIX.attlassian.net/)
 3. Set up your available and default issue type and priority levels  
 ![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/ea60ac5c-0928-4a24-ac00-530f3e3cdc95)
 6. Get the name of your Parent / Epic field (you may need to look at the existing issue fiields to see what the field is called https://PREFIX.atlassian.net/rest/api/2/issue/ABC-123)
 7. On the main sheet, press the *Sync Users and Projects* button to download all of the active users and their user IDs (needed to make assignments) and project keys availiable to you. 


### Usage
1. Add all of your required issue data. Project Key and Summary are required. Issue Type and Priority default values will be used if none are provided.  
 ![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/e0a384e4-9ea0-48a9-ad24-8945ab023c97)
2. Once the data is filled out, click on *Send to Jira*
3. If using the sheet for the first time, you will need to review and approve the authorization.  
![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/2f7489d5-50ee-40e7-94c8-50c48e7e957a)
4. Provide your Atlassian account name. If the field "Ask for Username" is unchecked, then the username will be only be asked once per browser user. 
5. Provide your API token generated above.
6. The issues will be created one by one and the results shown
![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/702ca6fa-803b-46a0-8744-21d14f232e70)
7. You can resubmit the data again. Issues checked as *Skip* will be updated (Summmry, Description, Assignee, Parent, and Priority only), while unchecked issues will be (re)created. 
   
## Supported fields
| Field Name  | Description | Required |Notes | Ticket Updated when Rerunning Script |
| ---  | --- | --- | --- | --- |
| Project  | Project key | YES | Only projects keys (e.g. ABC) is accepted. Value is forced to upper case. | NO, as moving an issue requires multiples steps Jira. |
| Summary  | Title of the issue. | YES | | YES |
| Type  | Issue Type (Task, Story, etc)| No, but a default value is used if left blank. | This assumes simple isue types. Other issues, such as Parent tickets, may require more fields than are currently supported. | NO, as sometimes changing issue type requires additional mapping steps. |
| Description  | Issue content | NO | | YES |
| Parent  | Parent (formerly Epic) the ticket can belong to | NO |---| YES (nulled if left blank) |
| Assignee  | User assigned to the ticket | NO |---| YES (unassinged if left blank)|
| Priority  | Priority level | NO, but a default is used if left blank | Priority level of the issue. Define existig custom priorities and defaul values if one is not provided. |YES|

## Troubleshooting
(This is under coonstruction)


