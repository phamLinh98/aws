import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient, CreateTableCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';

const s3Client = new S3Client({ region: 'ap-northeast-1' });

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const checkTableIfExistElseCreate = async (dynamodb, tableName) => {
    const params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
    };

    try {
        await dynamodb.send(new CreateTableCommand(params));
    } catch (err) {
        if (err.name !== 'ResourceInUseException') {
            throw err;
        }
    }
}

export async function handler(event) {
    const bucketName = 'linhclass-csv-bucket';
    const fileName = generateUUID(); // Tên file

    // TODO: save to dynamodb
    const dynamodb = new DynamoDBClient({ region: 'ap-northeast-1' });
    const tableName = 'upload-csv';
    await checkTableIfExistElseCreate(dynamodb, tableName);

    // Debug 1
    console.log('1. Check table exist');

    const putParams = {
        TableName: tableName,
        Item: {
            id: { S: fileName },
            status: { S: 'Uploading' },
            createdAt: { N: Date.now().toString() }
        },
    };
    await dynamodb.send(new PutItemCommand(putParams));

    // Debug 2
    console.log('2. Saved to dynamodb');

    const objectKey = 'csv/' + fileName + '.csv'; // Key của file
    const expiration = 3600; // Thời gian hết hạn của presigned URL (tính bằng giây)

    // Debug 1
    console.log('3. objectKey:', objectKey);

    const params = {
        Bucket: bucketName,
        Key: objectKey,
        ContentType: 'text/csv',
    };

    // Debug 5
    console.log('4. params:', params);

    try {
        const command = new PutObjectCommand(params);
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });

        // Debug 5
        console.log('5. presignedUrl:', presignedUrl);
        return {
            statusCode: 200,
            body: JSON.stringify({ presignedUrl }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Đã xảy ra lỗi khi tạo presigned URL' }),
        };
    }
}
