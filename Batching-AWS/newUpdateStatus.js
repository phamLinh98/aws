// Lambda Function 2: Handles Step 4
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import pkg from "@aws-sdk/client-dynamodb";
const { DynamoDBClient, PutItemCommand } = pkg;

const DynamoDB = new DynamoDBClient();

export const handler = async (event) => {
    try {
        // Update dynamoDB status
        const params = {
            TableName: 'upload-status',
            Item: {
                id: { S: '1' },
                status: { S: 'processing' }
            }
        };
    
        console.log('No 1 Tien hanh cap nhat thanh cong:', JSON.stringify(params, null, 2)); // Log the params for debugging
    
        await DynamoDB.send(new PutItemCommand(params));

        console.log('No 2 - Update DynamoDB status to processing');

        const updateParams = {
            TableName: 'upload-status',
            Key: {
                id: { S: '1' }
            },
            UpdateExpression: 'set #s = :s',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':s': { S: 'completed' } }
        };
        await DynamoDB.send(new UpdateItemCommand(updateParams));

        console.log('No 3 - Update DynamoDB status to completed');

        return { statusCode: 200, body: 'Success' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Error' };
    }
};