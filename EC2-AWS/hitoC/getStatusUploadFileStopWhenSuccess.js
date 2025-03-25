import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({});

export async function handler(event) {
    console.log('xxx event', JSON.stringify(event));

    const id = event.queryStringParameters.id;

    const params = {
        TableName: 'upload-csv',
        FilterExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': { S: id }
        }
    };

    try {
        const command = new ScanCommand(params);
        const data = await dynamoDBClient.send(command);

        if (data.Items.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify(data.Items[0])
            };

        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No records found' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}