import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const updateStatusToUploaded = async (dynamoDBClient, tableName, fileId) => {
    try {
        const updateCommand = new UpdateItemCommand({
            TableName: tableName,
            Key: {
                id: { S: fileId }, // Assuming 'id' is the primary key and is of type String
            },
            UpdateExpression: 'SET #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':status': { S: 'Uploaded' },
            },
        });
        await dynamoDBClient.send(updateCommand);
        console.log(`Updated status to 'Uploaded' for file ID: ${fileId}`);
    } catch (error) {
        console.error(`Error updating DynamoDB for file ID: ${fileId}`, error);
        throw new Error('Failed to update DynamoDB');
    }
}