import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

export async function handler(event) {
    const s3Client = new S3Client({ region: 'ap-northeast-1' });
    const sqsClient = new SQSClient({ region: 'ap-northeast-1' });

    const bucketName = 'linhclass-csv-bucket';

    try {
        const params = {
            Bucket: bucketName,
        };

        // List objects in the bucket
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);

        if (data.Contents && data.Contents.length > 0) {
            // Filter for CSV files and sort by LastModified in descending order
            const csvFiles = data.Contents
                .filter(file => file.Key.endsWith('.csv'))
                .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

            if (csvFiles.length > 0) {
                // Get csv first file csv in bucket s3
                const mostRecentFile = csvFiles[0].Key;
                const fileId = mostRecentFile.split('/').pop().replace('.csv', '');
                console.log(`Extracted file ID: ${fileId}`);

                // Update status to 'Uploaded' in DynamoDB
                const dynamoDBClient = new DynamoDBClient({ region: 'ap-northeast-1' });
                const tableName = 'upload-csv'; // Replace with your table name

                const updateParams = {
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
                };

                try {
                    const updateCommand = new UpdateItemCommand(updateParams);
                    await dynamoDBClient.send(updateCommand);
                    console.log(`Updated status to 'Uploaded' for file ID: ${fileId}`);
                } catch (error) {
                    console.error(`Error updating DynamoDB for file ID: ${fileId}`, error);
                    throw new Error('Failed to update DynamoDB');
                }

                // Send fileId to SQS
                const queueUrl = 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue-lambda'; // Replace with your actual SQS queue URL
                const sqsParams = {
                    QueueUrl: queueUrl,
                    MessageBody: JSON.stringify({ fileId }),
                };

                try {
                    const sendMessageCommand = new SendMessageCommand(sqsParams);
                    const sqsResponse = await sqsClient.send(sendMessageCommand);
                    console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
                } catch (error) {
                    console.error('Error sending message to SQS:', error);
                    throw new Error('Failed to send message to SQS');
                }


                return {
                    statusCode: 200,
                    body: JSON.stringify({ fileName: mostRecentFile }),
                };

            } else {
                console.log('No CSV files found in the bucket.');
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'No CSV files found in the bucket.' }),
                };
            }
        } else {
            console.log('No files found in the bucket.');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No files found in the bucket.' }),
            };
        }
    } catch (error) {
        console.error('Error fetching file name:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}
