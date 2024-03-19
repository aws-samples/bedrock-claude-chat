# Administrator dashboard

The administrator dashboard is a vital tool as it provides essential insights into custom bot usage and user behavior. Without the functionality, it would be challenging for administrators to understand which custom bots are popular, why they are popular, and who is using them. This information is crucial for optimizing instruction prompts, customizing RAG data sources, and identifying heavy users who might will be an influencer.

## Features

Currently provides a basic overview of chatbot and user usage, focusing on aggregating data for each bot and user over specified time periods and sorting the results by usage fees.

TODO
Screenshot

## Notes

- As stated in the [architecture](../README.md#architecture), the admin features will refer to the S3 bucket exported from DynamoDB. Please note that since the export is performed once every hour, the latest conversations may not be reflected immediately.

- In public bot usages, bots that have not been used at all during the specified period will not be listed.

- In user usages, users who have not used the system at all during the specified period will not be listed.
