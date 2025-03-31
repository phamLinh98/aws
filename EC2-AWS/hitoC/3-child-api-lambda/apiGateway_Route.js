import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const dynamoClient = new DynamoDBClient({ region: 'ap-northeast-1' });

export const handler = async (event) => {
  try {
    // Extract fileId from query string parameters
    const fileId = event.queryStringParameters?.fileId;
    console.log('fileId123', fileId);

    if (!fileId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'fileId is required' }),
      };
    }

    // Define the API URLs
    const apiUrls = [
      'https://cssfahw7v5.execute-api.ap-northeast-1.amazonaws.com/get-avatar',
      'https://cssfahw7v5.execute-api.ap-northeast-1.amazonaws.com/get-role',
      'https://cssfahw7v5.execute-api.ap-northeast-1.amazonaws.com/get-mail',
    ];

    // Call APIs sequentially
    const apiResults = [];
    for (const url of apiUrls) {
      try {
        const response = await fetch(url);
        const result = await response.json();
        apiResults.push(result);
        console.log(`API Result for ${url}:`, result); // Log each result
      } catch (fetchError) {
        console.error(`Error fetching ${url}:`, fetchError);
        // Handle the error appropriately - e.g., return an error response,
        // or continue to the next API call, depending on your requirements.
        // If you want to fail the whole process on any API failure, re-throw:
        // throw fetchError;
        // Or, if you want to just log and continue:
        apiResults.push({error: fetchError.message}); // Push an error object to results
      }
    }

    // Update the DynamoDB table
    const updateParams = {
      TableName: 'upload-csv',
      Key: {
        id: { S: fileId },
      },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': { S: 'Success' },
      },
    };

    await dynamoClient.send(new UpdateItemCommand(updateParams));

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', apiResults }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
    };
  }
};