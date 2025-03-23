import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDBClient = new DynamoDBClient({});

export async function handler(event) {
    const params = {
        TableName: 'upload-csv',
        Limit: 1
    };

    try {
        const command = new ScanCommand(params);
        const data = await dynamoDBClient.send(command);

        if (data.Items && data.Items.length > 0) {
            const uuid = data.Items[0].id.S; // DynamoDB trả về giá trị dưới dạng đối tượng
            const status = data.Items[0].status.S; // DynamoDB trả về giá trị dưới dạng đối tượng
            return {
                statusCode: 200,
                body: JSON.stringify({ uuid, status })
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