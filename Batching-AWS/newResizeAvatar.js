// Lambda Function 2: Handles Step 4
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const S3 = new S3Client();

export const handler = async (event) => {

    try {    
        // Get image key from DynamoDB - Mock image key is 'linh.png'
        const imageKey = 'linh.png';

        // Get image from S3 bucket: linhclass-upload-csv-user-info-bucket
        const getObjectParams = {
            Bucket: 'linhclass-upload-user-info-bucket',
            Key: imageKey
        };
        const data = await S3.send(new GetObjectCommand(getObjectParams));
        const image = await new Promise((resolve, reject) => {
            const chunks = [];
            data.Body.on('data', (chunk) => chunks.push(chunk));
            data.Body.on('end', () => resolve(Buffer.concat(chunks)));
            data.Body.on('error', reject);
        });

        console.log('No 3 - Get image from S3 bucket');

        // Call function resizePicture to resize the image
        const resizedImage = await resizePicture(image);

        console.log('No 4 - Resize image. resizedImage buffer:', resizedImage);
        console.log('No 4.1 resizedImage base64:', resizedImage.toString('base64'));

        // Save the resized image to S3 bucket: linhclass-resize-image-bucket
        const putObjectParams = {
            Bucket: 'linhclass-resize-avatar-bucket',
            Key: imageKey,
            Body: resizedImage
        };
        await S3.send(new PutObjectCommand(putObjectParams));

        console.log('No 5 - Save the resized image to S3 bucket');

        return { statusCode: 200, body: 'Success' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Error' };
    }
};

const resizePicture = async (image) => {
    // This function is dummy resizePicture function that returns the same image
    return image;
};