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
      'https://ne3j40rhmj.execute-api.ap-northeast-1.amazonaws.com/get-avatar',
      // 'https://ne3j40rhmj.execute-api.ap-northeast-1.amazonaws.com/get-roles',
      // 'https://ne3j40rhmj.execute-api.ap-northeast-1.amazonaws.com/get-email',
    ];

    // Call all APIs concurrently
    const apiResponses = await Promise.all(apiUrls.map((url) => fetch(url)));
    const apiResults = await Promise.all(apiResponses.map((res) => res.json()));

    // Log the API results (optional)
    console.log('API Results:', apiResults);

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