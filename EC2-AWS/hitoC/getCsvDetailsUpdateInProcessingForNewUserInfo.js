import { SQSClient } from '@aws-sdk/client-sqs';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const sqsClient = new SQSClient({ region: 'ap-northeast-1' });
const dynamoDbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const s3 = new S3Client({ region: 'ap-northeast-1' });

export async function handler(event) {
    try {
        // Lặp qua từng message trong event
        for (const record of event.Records) {
            // Lấy body của message
            const body = JSON.parse(record.body);

            // Lấy fileId từ message
            const fileId = body.fileId;
            console.log('File ID:', fileId);

            // // Xóa message khỏi hàng đợi
            // const deleteParams = {
            //     QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue-lambda',
            //     ReceiptHandle: record.receiptHandle,
            // };

            // const command = new DeleteMessageCommand(deleteParams);
            // await sqsClient.send(command);
            // console.log('Message deleted successfully');

            // Cập nhật upload-csv trường status > 'InProcessing'
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
            console.log(`Status updated to 'InProcessing' for fileId: ${fileId}`); // OK


            //TODO: Xử lý logic đọc file csv tại đây
            const bucketName = 'linhclass-csv-bucket';
            const nameFIle = fileId;
            console.log('fileId hien tai', fileId)
            const keyName = `csv/${nameFIle}.csv`;
            const tableName = 'upload-csv'; // Replace with your DynamoDB table name
            
            // Đọc nội dung CSV từ S3
            try {
                const params = {
                    Bucket: bucketName,
                    Key: keyName,
                };

                console.log('params hien tai', params)

                // Use GetObjectCommand to fetch the object
                const command = new GetObjectCommand(params);
                const data = await s3.send(command);

                console.log('da pass qua data hien tai', data);

                // Convert the stream to a string
                const streamToString = (stream) =>
                    new Promise((resolve, reject) => {
                        const chunks = [];
                        stream.on('data', (chunk) => chunks.push(chunk));
                        stream.on('error', reject);
                        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
                    });

                const csvString = await streamToString(data.Body);
                console.log('da pass qua csvString', csvString);

                // Convert CSV string to JSON
                const lines = csvString.split('\n');
                const headers = lines[0].split(',');
                const jsonData = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const obj = {};
                    for (let i = 0; i < headers.length; i++) {
                        obj[headers[i].trim()] = values[i] ? values[i].trim() : null;
                    }
                    return obj;
                });

                console.log('jsonData', jsonData);

                // Cập nhật thêm trường cho bảng upload-csv trên dynamodb
                try {
                    const updateParams = {
                        TableName: tableName,
                        Key: {
                            id: { S: nameFIle }, // Assuming 'id' is the primary key and its type is String
                        },
                        UpdateExpression: 'SET #status = :status, #name_attr = :name_val, #age_attr = :age_val, #avatar_attr = :avatar_val, #salary_attr = :salary_val, #position_attr = :position_val', // Use ExpressionAttributeNames to avoid reserved words
                        ExpressionAttributeNames: {
                            '#status': 'status',
                            '#name_attr': 'name',
                            '#age_attr': 'age',
                            '#avatar_attr': 'avatar',
                            '#salary_attr': 'salary',
                            '#position_attr': 'position',
                        },
                        ExpressionAttributeValues: {
                            ':status': { S: 'InsertSuccess' },
                            ':name_val': { S: jsonData[0].name || null },  // Assuming you want to update with the first item's data. Handle empty jsonData. Add null handling.
                            ':age_val': { S: jsonData[0].age || null },  // Always use string values for simplicity.  Convert if necessary in other parts of your code.
                            ':avatar_val': { S: jsonData[0].avatar || null },
                            ':salary_val': { S: jsonData[0].salary || null },
                            ':position_val': { S: jsonData[0].position || null },
                        },
                        ReturnValues: 'UPDATED_NEW',  // Optional: To see the updated values
                    };


                    const updateCommand = new UpdateItemCommand(updateParams);
                    const updateResponse = await dynamoDbClient.send(updateCommand);
                    console.log('DynamoDB Update Response:', updateResponse);

                } catch (dynamoError) {
                    console.error('Error updating DynamoDB:', dynamoError);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ message: 'Lỗi khi cập nhật DynamoDB.', error: dynamoError.message }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    };
                }
            } catch (error) {
                console.error('Lỗi khi đọc file CSV từ S3:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Lỗi khi đọc file CSV từ S3.' }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
            }
        }

    } catch (error) {
        console.error('Error processing SQS message:', error);
        throw error;
    }
}