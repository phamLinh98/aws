import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: 'ap-northeast-1' });

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export async function handler(event) {
    const bucketName = 'linhclass-test';
    const fileName = generateUUID(); // Tên file
    // TODO: save to dynamodb
    const objectKey = 'images/' + fileName; // Đường dẫn của file trong bucket
    const expiration = 3600; // Thời gian hết hạn của presigned URL (tính bằng giây)

    // Debug 1
    console.log('1. event:', event);

    const params = {
        Bucket: bucketName,
        Key: objectKey,
        ContentType: 'application/octet-stream', // Kiểu dữ liệu của file
    };

    // Debug 2
    console.log('2. params:', params);

    try {
        const command = new PutObjectCommand(params);
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });
        
        // Debug 3
        console.log('3. presignedUrl:', presignedUrl);
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