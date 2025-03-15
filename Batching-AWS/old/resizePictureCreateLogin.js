// Lambda Function 2: Handles Step 4
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import pkg from "@aws-sdk/client-dynamodb";
const { DynamoDBClient, PutItemCommand } = pkg;

const DynamoDB = new DynamoDBClient();
const S3 = new S3Client();

export const handler = async (event) => {
    const message = JSON.parse(event.Records[0].body);
    const batchId = message.batchId;

    try {
        console.log(`No 1 - Batch ID: ${batchId} - message: ${JSON.stringify(message)}`);
        // Update dynamoDB status
        const params = {
            TableName: 'upload-status',
            Item: {
                id: { S: '1' },
                status: { S: 'processing' }
            }
        };
    
        console.log('Put Item Params:', JSON.stringify(params, null, 2)); // Log the params for debugging
    
        await DynamoDB.send(new PutItemCommand(params));

        console.log('No 2 - Update DynamoDB status to processing');

        // Get image key from DynamoDB - Mock image key is 'linh.png'
        const imageKey = 'linh.png';

        // Get image from S3 bucket: linhclass-upload-csv-user-info-bucket
        const getObjectParams = {
            Bucket: 'linhclass-upload-csv-user-info-bucket',
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

        // Call functiuon resizePicture to resize the image
        const resizedImage = await resizePicture(image);

        console.log('No 4 - Resize image. resizedImage buffer:', resizedImage);
        console.log('No 4.1 resizedImage base64:', resizedImage.toString('base64'));

        // Save the resized image to S3 bucket: linhclass-resize-image-bucket
        const putObjectParams = {
            Bucket: 'linhclass-upload-csv-user-info-bucket',
            Key: imageKey,
            Body: resizedImage
        };
        await S3.send(new PutObjectCommand(putObjectParams));

        console.log('No 5 - Save the resized image to S3 bucket');

        // Update dynamoDB status to "completed"
        const updateParams = {
            TableName: 'upload-status',
            Key: {
                id: { S: '1' }
            },
            UpdateExpression: 'set #s = :s',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':s': { S: 'completed' } }
        };
        await DynamoDB.send(new UpdateItemCommand(updateParams));

        console.log('No 6 - Update DynamoDB status to completed');

        return { statusCode: 200, body: 'Success' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: 'Error' };
    }
};

const resizePicture = async (image) => {
    // This function is dummy resizePicture function that rerturns the same image
    return image;
}