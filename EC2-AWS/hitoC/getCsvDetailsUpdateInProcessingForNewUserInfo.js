import { SQSClient, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const sqsClient = new SQSClient({ region: 'ap-northeast-1' });
const dynamoDbClient = new DynamoDBClient({ region: 'ap-northeast-1' });

export async function handler(event) {
    try {
        // Lặp qua từng message trong event
        for (const record of event.Records) {
            // Lấy body của message
            const body = JSON.parse(record.body);

            // Lấy fileId từ message
            const fileId = body.fileId;
            console.log('File ID:', fileId);

            // Xóa message khỏi hàng đợi
            const deleteParams = {
                QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue-lambda',
                ReceiptHandle: record.receiptHandle,
            };
            const command = new DeleteMessageCommand(deleteParams);
            await sqsClient.send(command);
            console.log('Message deleted successfully');

            // Update the status of the record in the DynamoDB table in fileId to 'InProcessing'
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
                    ':status': { S: 'InProcessing' },
                },
            };
            const updateCommand = new UpdateItemCommand(updateParams);
            await dynamoDbClient.send(updateCommand);
            console.log(`Status updated to 'InProcessing' for fileId: ${fileId}`);

            //TODO: 
        const s3Client = new S3Client({ region: 'ap-northeast-1' });

        async function readCsvFromS3(bucketName, fileName) {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName,
            });

            const response = await s3Client.send(command);
            const stream = response.Body;

            const chunks = [];
            for await (const chunk of Readable.from(stream)) {
                chunks.push(chunk);
            }

            const csvContent = Buffer.concat(chunks).toString('utf-8');
            return csvContent.split('\n').slice(1).map(line => {
                const [name, position, salary, age, avatar] = line.split(',');
                return { name, position, salary, age, avatar };
            });
        }

        const bucketName = 'linhclass-csv-bucket';
        const fileName = `${fileId}.csv`;

        const csvData = await readCsvFromS3(bucketName, fileName);

        if (csvData.length > 0) {
            const { name, position, salary, age, avatar } = csvData[0];

            const updateParams = {
                TableName: 'upload-csv',
                Key: {
                    id: { S: fileId },
                },
                UpdateExpression: 'SET #name = :name, #position = :position, #salary = :salary, #age = :age, #avatar = :avatar',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#position': 'position',
                    '#salary': 'salary',
                    '#age': 'age',
                    '#avatar': 'avatar',
                },
                ExpressionAttributeValues: {
                    ':name': { S: name },
                    ':position': { S: position },
                    ':salary': { S: salary },
                    ':age': { S: age },
                    ':avatar': { S: avatar },
                },
            };

            const updateCommand = new UpdateItemCommand(updateParams);
            await dynamoDbClient.send(updateCommand);
            console.log(`Record updated for fileId: ${fileId}`);
         }
        }

    } catch (error) {
        console.error('Error processing SQS message:', error);
        throw error;
    }
}