import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { generateUUID } from './createGenerateUUID';
import { checkTableIfExistElseCreate } from './createTableUploadStatusIfNotExist';
import { createPresignedUrl } from './createPreSignedUrl';

const s3Client = new S3Client({ region: 'ap-northeast-1' });

export async function handler(event) {

    const bucketName = 'linhclass-csv-bucket';

    // Tạo một UUID ngẫu nhiên
    const fileName = generateUUID(); // Tên file

    // TODO: save to dynamodb
    const dynamodb = new DynamoDBClient({ region: 'ap-northeast-1' });
    const tableName = 'upload-csv';

    // Kiểm tra xem bảng Upload-status đã tồn tại chưa, nếu chưa thì tạo bảng mới
    await checkTableIfExistElseCreate(dynamodb, tableName);

    // Debug 1
    console.log('1. Check table exist');j

    // Cập nhật status và uuid vào bảng upload-status
    await dynamodb.send(new PutItemCommand({
        TableName: tableName,
        Item: {
            id: { S: fileName },
            status: { S: 'Uploading' },
            createdAt: { N: Date.now().toString()}
        },
    }));

    // Debug 2
    console.log('2. Saved to dynamodb');

    const objecsttKey = 'csv/' + fileName + '.csv'; // Key của file
    const expiration = 3600; // Thời gian hết hạn của presigned URL (tính bằng giây)

    // Debug 3
    console.log('3. objectKey:', objectKey);

    // Tạo 1 Presigned URL cho phép Upload 1 file lên S3 thông qua HTTP PUT
    const data = await createPresignedUrl(s3Client, bucketName, objectKey, expiration,fileName)

    return data;
}
