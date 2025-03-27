import { S3Client, CreateBucketCommand, HeadBucketCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const SOURCE_BUCKET = "linhclass-csv-bucket";
const DESTINATION_BUCKET = "linhclass-storage-bucket";
const S3_KEY = "picture/1742982504713.jpeg";
const DESTINATION_KEY = "linh.jpeg";
const DYNAMODB_TABLE = "Users";
const AWS_REGION = 'ap-northeast-1';

const s3Client = new S3Client({ region: AWS_REGION });
const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event) => {
  try {
    // Check if the bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: DESTINATION_BUCKET }));
      console.log(`Bucket ${DESTINATION_BUCKET} already exists.`);
    } catch (headBucketError) {
      if (headBucketError.name === "NotFound") {
        // Create the bucket if it doesn't exist
        const createBucketParams = {
          Bucket: DESTINATION_BUCKET,
          CreateBucketConfiguration: {
            LocationConstraint: AWS_REGION,
          },
        };
        await s3Client.send(new CreateBucketCommand(createBucketParams));
        console.log(`Bucket ${DESTINATION_BUCKET} created successfully.`);
      } else {
        console.error("Error checking bucket existence:", headBucketError);
        throw headBucketError;
      }
    }

    // Copy the image from the source bucket to the destination bucket
    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: SOURCE_BUCKET,
        Key: S3_KEY,
      });
      const getObjectResponse = await s3Client.send(getObjectCommand);

      const putObjectParams = {
        Bucket: DESTINATION_BUCKET,
        Key: DESTINATION_KEY,
        Body: await getObjectResponse.Body.transformToByteArray(),
        ContentType: 'image/jpeg',
      };
      await s3Client.send(new PutObjectCommand(putObjectParams));
      console.log(`Image copied from s3://${SOURCE_BUCKET}/${S3_KEY} to s3://${DESTINATION_BUCKET}/${DESTINATION_KEY}`);
    } catch (copyError) {
      console.error("Error copying image:", copyError);
      throw copyError;
    }

    // Update the avatar field in DynamoDB
    const imageUrl = `s3://${DESTINATION_BUCKET}/${DESTINATION_KEY}`; // Định dạng mới
    let scanResults;
    try {
      const scanParams = {
        TableName: DYNAMODB_TABLE,
      };
      scanResults = await dynamoDBClient.send(new ScanCommand(scanParams));
    } catch (scanError) {
      console.error("Error scanning DynamoDB table:", scanError);
      throw scanError;
    }

    if (scanResults.Items && scanResults.Items.length > 0) {
      for (const item of scanResults.Items) {
        try {
          const updateParams = {
            TableName: DYNAMODB_TABLE,
            Key: {
              id: item.id,
            },
            UpdateExpression: "set avatar = :avatarUrl",
            ExpressionAttributeValues: {
              ":avatarUrl": { S: imageUrl },
            },
          };
          await dynamoDBClient.send(new UpdateItemCommand(updateParams));
          console.log(`Updated avatar for user with id: ${item.id.S}`);
        } catch (updateError) {
          console.error(`Error updating avatar for user with id: ${item.id.S}`, updateError);
        }
      }
    } else {
      console.log("No users found in DynamoDB table.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Avatar URLs updated successfully." }),
    };
  } catch (error) {
    console.error("Lambda function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing request.", error: error.message }),
    };
  }
};