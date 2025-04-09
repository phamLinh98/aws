import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSClient } from '@aws-sdk/client-sqs';
import { updateStatusToUploaded } from './updateStatusToUploaded';
import { sendMessageToQueueSQS } from './sendMessageToQueueSQS';

export async function handler(event) {
    console.log("Received event:", JSON.stringify(event, null, 2)); // Log the entire event

    // Khởi tạo DynamoDB và SQS client
    const dynamoDBClient = new DynamoDBClient({ region: 'ap-northeast-1' });
    const sqsClient = new SQSClient({ region: 'ap-northeast-1' });

    // Khi có sự kiện từ S3, nó sẽ đưa cho lambda này 1 event và từ event lấy ra bucket name và object key
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;

    console.log(`Bucket: ${bucketName}`);
    console.log(`Object Key: ${objectKey}`);

    // Nếu không có file nào đuôi .csv thì exit 
    if (!objectKey.endsWith('.csv')) {
        console.log('Not a CSV file.  Exiting.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Not a CSV file.  No action taken.' }),
        };
    }

    try {
        // Lấy fileId từ objectKey
        const fileId = objectKey.split('/').pop().replace('.csv', '');

        console.log(`Extracted file ID: ${fileId}`);

        // Update status to 'Uploaded' in DynamoDB
        const tableName = 'upload-csv'; // Replace with your table name

        // Update status to 'Uploaded' in DynamoDB
        await updateStatusToUploaded(dynamoDBClient, tableName, fileId);

        // Gửi 1 message queue tới SQS 
        const sqsParams = {
            QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue',
            MessageBody: JSON.stringify({ fileId }),
        };

        await sendMessageToQueueSQS(sqsClient, sqsParams);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Successfully processed file: ${objectKey}` }),
        };

    } catch (error) {
        console.error('Error processing file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        };
    }
}