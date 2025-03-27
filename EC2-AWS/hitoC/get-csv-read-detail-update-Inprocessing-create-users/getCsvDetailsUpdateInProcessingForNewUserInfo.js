import { DynamoDBClient, UpdateItemCommand, PutItemCommand, GetItemCommand, CreateTableCommand, ListTablesCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const dynamoDbClient = new DynamoDBClient({ region: 'ap-northeast-1' });
const s3 = new S3Client({ region: 'ap-northeast-1' });
const sqs = new SQSClient({ region: 'ap-northeast-1' }); // Khởi tạo SQS Client

// Tạo bảng User (nếu cần) và cập nhật trạng thái của file CSV thành InProcessing
async function ensureUsersTableExists() {
    const tableName = 'Users';

    const listTablesCommand = new ListTablesCommand({});
    const tables = await dynamoDbClient.send(listTablesCommand);

    if (!tables.TableNames.includes(tableName)) {
        console.log(`Table ${tableName} does not exist. Creating table...`);

        const createTableParams = {
            TableName: tableName,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' },
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
            },
        };

        const createTableCommand = new CreateTableCommand(createTableParams);
        await dynamoDbClient.send(createTableCommand);
        console.log(`Table ${tableName} created successfully.`);
    } else {
        console.log(`Table ${tableName} already exists.`);
    }
}

export async function handler(event) {
    try {
        await ensureUsersTableExists();
        for (const record of event.Records) {
            const body = JSON.parse(record.body);
            // xử lý lấy message từ queue ?
            const fileId = body.fileId;

            //Xoa toàn bộ message từ trên sqs 
            const queueUrl = 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue-lambda';
            try {
                const deleteParams = {
                    QueueUrl: queueUrl,
                    ReceiptHandle: record.receiptHandle,
                };

                await sqs.send(new DeleteMessageCommand(deleteParams));
                console.log('SQS message deleted successfully.');
            } catch (error) {
                console.error('Error deleting SQS message:', error);
                throw error;
            }


            console.log('File ID:', fileId)
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

            const bucketName = 'linhclass-csv-bucket';
            const keyName = `csv/${fileId}.csv`;
            const userTableName = 'Users';

            try {
                const params = {
                    Bucket: bucketName,
                    Key: keyName,
                };

                const command = new GetObjectCommand(params);
                const data = await s3.send(command);

                //Đọc nội dung csv upload lên s3 và insert vào bảng User
                const streamToString = (stream) =>
                    new Promise((resolve, reject) => {
                        const chunks = [];
                        stream.on('data', (chunk) => chunks.push(chunk));
                        stream.on('error', reject);
                        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
                    });

                const csvString = await streamToString(data.Body);
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

                for (const userData of jsonData) {
                    const userId = userData.id;
                    const userName = userData.name;
                    const userAge = userData.age ? parseInt(userData.age) : null;
                    const userAvatar = userData.avatar;
                    const userPosition = userData.position;
                    const userSalary = userData.salary ? parseFloat(userData.salary) : null;

                    const getUserParams = {
                        TableName: userTableName,
                        Key: {
                            id: { S: userId },
                        },
                    };

                    const getUserCommand = new GetItemCommand(getUserParams);

                    try {
                        const getUserResponse = await dynamoDbClient.send(getUserCommand);

                        if (getUserResponse.Item) {
                            console.log(`User with ID ${userId} exists. Updating user.`);

                            const updateParams = {
                                TableName: userTableName,
                                Key: {
                                    id: { S: userId },
                                },
                                UpdateExpression: 'SET #name = :name, #age = :age, #avatar = :avatar, #position = :position, #salary = :salary, #uuid = :uuid',
                                ExpressionAttributeNames: {
                                    '#name': 'name',
                                    '#age': 'age',
                                    '#avatar': 'avatar',
                                    '#position': 'position',
                                    '#salary': 'salary',
                                    '#uuid': 'uuid',
                                },
                                ExpressionAttributeValues: {
                                    ':name': { S: userName },
                                    ':age': { N: userAge !== null ? userAge.toString() : '0' },
                                    ':avatar': { S: userAvatar },
                                    ':position': { S: userPosition },
                                    ':salary': { N: userSalary !== null ? userSalary.toString() : '0' },
                                    ':uuid': { S: fileId },
                                },
                            };

                            const updateCommand = new UpdateItemCommand(updateParams);
                            await dynamoDbClient.send(updateCommand);

                            console.log(`User with ID ${userId} updated successfully.`);
                        } else {
                            console.log(`User with ID ${userId} does not exist. Inserting new user.`);

                            const putParams = {
                                TableName: userTableName,
                                Item: {
                                    id: { S: userId },
                                    name: { S: userName },
                                    age: { N: userAge !== null ? userAge.toString() : '0' },
                                    avatar: { S: userAvatar },
                                    position: { S: userPosition },
                                    salary: { N: userSalary !== null ? userSalary.toString() : '0' },
                                    uuid: { S: fileId },
                                },
                            };

                            const putCommand = new PutItemCommand(putParams);
                            await dynamoDbClient.send(putCommand);
                            console.log(`User with ID ${userId} inserted successfully.`);
                        }
                    } catch (dynamoError) {
                        console.error('Error interacting with DynamoDB:', dynamoError);
                        throw dynamoError;
                    }
                }

                //TODO: Bổ sung logic bảng upload-csv trường status thành InsertSuccess cho uuid = fileId
                const updateCsvParams = {
                    TableName: 'upload-csv',
                    Key: {
                        id: { S: fileId },
                    },
                    UpdateExpression: 'SET #status = :status',
                    ExpressionAttributeNames: {
                        '#status': 'status',
                    },
                    ExpressionAttributeValues: {
                        ':status': { S: 'InsertSuccess' },
                    },
                };
                const updateCsvCommand = new UpdateItemCommand(updateCsvParams);
                await dynamoDbClient.send(updateCsvCommand);
                console.log(`Status updated to 'InsertSuccess' for fileId: ${fileId}`);


                //TODO: Cập nhật trạng thái những record InsertSuccess thành BatchRunning
                const scanParams = {
                    TableName: 'upload-csv',
                    FilterExpression: '#status = :status',
                    ExpressionAttributeNames: {
                        '#status': 'status',
                    },
                    ExpressionAttributeValues: {
                        ':status': { S: 'InsertSuccess' },
                    },
                };

                const scanCommand = new ScanCommand(scanParams); //HERE
                console.log('scanCommand', scanCommand);
                const scanResponse = await dynamoDbClient.send(scanCommand);
                console.log('scanResponseDemo123', scanResponse.Items)
                if (scanResponse.Items && scanResponse.Items.length > 0) {
                    for (const item of scanResponse.Items) {
                        const updateBatchParams = {
                            TableName: 'upload-csv',
                            Key: {
                                id: item.id,
                            },
                            UpdateExpression: 'SET #status = :status',
                            ExpressionAttributeNames: {
                                '#status': 'status',
                            },
                            ExpressionAttributeValues: {
                                ':status': { S: 'BatchRunning' },
                            },
                        };

                        const updateBatchCommand = new UpdateItemCommand(updateBatchParams);
                        await dynamoDbClient.send(updateBatchCommand);
                        console.log(`Status updated to 'BatchRunning' for fileId: ${item.id.S}`);

                        // Fetch API with item.id
                        const apiUrl = 'https://ne3j40rhmj.execute-api.ap-northeast-1.amazonaws.com/get-route';
                        const fileId = encodeURIComponent(item.id.S);
                        try {
                            const response = await fetch(`${apiUrl}?fileId=${fileId}`, {
                                method: 'GET',
                            });

                            if (!response.ok) {
                                throw new Error(`API call failed with status ${response.status}`);
                            }

                            const responseData = await response.json();
                            console.log(`API response for fileId ${item.id.S}:`, responseData);
                        } catch (apiError) {
                            console.error(`Error calling API Gateway for fileId ${item.id.S}:`, apiError);
                        }
                    }
                } else {
                    console.log('No records with status "InsertSuccess" found.');
                }
            } catch (error) {
                console.error('Error reading CSV file from S3:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Error reading CSV file from S3.' }),
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