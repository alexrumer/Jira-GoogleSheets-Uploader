# Jira-GoogleSheets-Uploader

## Introduction
This is an early version of the Google Sheets Jira Uploader tool. It allows a user to create bulk issues in different Jira project in a single operation. 
![image](https://github.com/user-attachments/assets/869513e1-0b31-459a-b126-3d430b4fe33a)


Access it here [Google Sheet](https://docs.google.com/spreadsheets/d/1MNpOlAPB5ZpoOhahrRmF7zc7uh9vcKTDTO_s7sIjZjw/edit?gid=1564783105#gid=1564783105).

## Instructions
### Get API Key
In order to use this tool, you will need to get an [API token from Atlassian](https://id.atlassian.com/manage-profile/security/api-tokens) and follow along [their guide](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/). Save this key in the password manager of your choice and rotate it often. This key is only used to access the Jira API, and is not stored, logged, or sent anywhere else.

### Configuration
 1. Save a copy of this sheet. 
 2. Navigate to the Config tab.
 3. Enter your Jira cloud subdomain (from the URL https://SUBDOMAIN.atlassian.net/)
    ![image](https://github.com/user-attachments/assets/80b8a629-c047-473f-a477-057d5e7898f5)
 4. Set up your available issue type, priority levels, and issue link types.
 5. Use the dropdowns to select the default values for issues, priority, and issue types for when the user does not provide them.
   ![image](https://github.com/user-attachments/assets/bda875b3-d009-48ba-a2da-957e24e11678)
 6. On the main sheet, select *Jira Uploader -> Sync Users and Projects* to download all of the active users (needed to assignment users to issues) as well as the Jira project keys for creating tickets in correct projects. Only the projects you have access to will be downloaded. THese will be saved to your copy of the sheet in the Projects and Users tab.
  ![image](https://github.com/user-attachments/assets/359e573e-d054-4f32-a3e3-45dfdf0799ce)
   
### Usage
1. Add all of your required issue data. Project Key and Summary are required. Issue Type and Priority default values will be used if none are provided. For IssueLink, select from the dropdown the issue ID (see the left most column) for the issue you want to link to. For example, if the default issue link type is Blocks, and the first issue selected in the IssueLink field, when created that issue will be shown as "Blocked by" the issue on line 1. 
 ![image](https://github.com/user-attachments/assets/40f3a9eb-af41-476c-bb92-eadb449e085a)
2. Once the data is filled out, click on **Jira Uploader -> Send Data to Jira*.
3. If using the sheet for the first time, you will need to review and approve the authorization. Click *OK* on the pop-up, and then click on *Advanced* and finally on Go to *Jira Uploader (unsafe)*. Run the commmand again after approving the sheet.
![image](https://github.com/alexrumer/Jira-GoogleSheets-Uploader/assets/20408958/2f7489d5-50ee-40e7-94c8-50c48e7e957a)
4. Provide your Atlassian account name. If the field "Ask for Username" is unchecked, then the username will be only be asked once per browser user. 
5. Provide your API token generated above.
6. The issues will be created one by one and the results shown.
![image](https://github.com/user-attachments/assets/956b96ca-ee9f-4743-9f42-00791a28dd42)
7. You can resubmit the data again. Issues checked as *Skip* will be updated (Summary, Description, Assignee, Parent, and Priority only), while unchecked issues will be recreated with new issue IDs or if they were added since the last execution, created for the first time.
8. Note: some fields are hidden by default to ease of use. To unhide these fields, select *Jira Uploader -> Show Advanced Fields*.
9. Once done, select *Jira Uploader -> Reset Sheet (Clear Issues)* to reset the sheet to default state for next use.
   
## Supported fields
| Field Name  | Description | Required |Notes | Ticket Updated when Rerunning Script | Hidden |
| ---  | --- | --- | --- | --- | --- |
| Project  | Project key | YES | Only projects keys (e.g. ABC) is accepted. Value is forced to upper case. | NO, as moving an issue requires multiples steps Jira. | NO |
| Summary  | Title of the issue. | YES | | YES | NO |
| Type  | Issue Type (Task, Story, etc)| No, but a default value is used if left blank. | This assumes simple issue types. Other issues, such as Parent tickets, may require more fields than are currently supported. | NO, as sometimes changing issue type requires additional mapping steps. | NO |
| Description  | Issue content | NO | | YES | NO |
| Parent  | Parent (formerly Epic) the ticket can belong to | NO |---| YES (nulled if left blank) | NO |
| Assignee  | User assigned to the ticket | NO |---| YES (unassigned if left blank)| NO |
| Priority  | Priority level | NO, but a default is used if left blank | Priority level of the issue. Define existing custom priorities and default values if one is not provided. |YES| NO |
| IssueLinkTpe | The link type (e.g. "Blocks") used to link the issue | NO, The default link type will be used is a linked issue is elected, but the link type is unspecified. | New links added only, but old ones are not deleted. | YES, only if different link type. | YES |
| IssueLink | Outward Link to issue | NO | YES | YES, only if different link type. | NO |

## Troubleshooting
##General troubleshooting
1. Sometimes issues will fail to be created if some non-default fields are required for issue creation (e.g. reproduction steps). Check the error message provided. You will need to modify the source code to add those. 


