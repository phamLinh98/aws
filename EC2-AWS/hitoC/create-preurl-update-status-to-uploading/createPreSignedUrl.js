import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const createPresignedUrl = async (s3Client, bucketName, objectKey, expiration, fileName) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            ContentType: 'text/csv',
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });

        // Debug 4
        console.log('4. presignedUrl:', presignedUrl);

        return {
            statusCode: 200,
            body: JSON.stringify({
                presignedUrl,
                id: fileName,
            }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Đã xảy ra lỗi khi tạo presigned URL' }),
        };
    }
}