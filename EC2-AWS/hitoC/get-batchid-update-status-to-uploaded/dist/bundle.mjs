// index.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";

// updateStatusToUploaded.js
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
var updateStatusToUploaded = async (dynamoDBClient, tableName, fileId) => {
  try {
    const updateCommand = new UpdateItemCommand({
      TableName: tableName,
      Key: {
        id: { S: fileId }
        // Assuming 'id' is the primary key and is of type String
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": { S: "Uploaded" }
      }
    });
    await dynamoDBClient.send(updateCommand);
    console.log(`Updated status to 'Uploaded' for file ID: ${fileId}`);
  } catch (error) {
    console.error(`Error updating DynamoDB for file ID: ${fileId}`, error);
    throw new Error("Failed to update DynamoDB");
  }
};

// sendMessageToQueueSQS.js
import { SendMessageCommand } from "@aws-sdk/client-sqs";
var sendMessageToQueueSQS = async (sqsClient, sqsParams) => {
  try {
    const sendMessageCommand = new SendMessageCommand(sqsParams);
    const sqsResponse = await sqsClient.send(sendMessageCommand);
    console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw new Error("Failed to send message to SQS");
  }
};

// index.js
async function handler(event) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const dynamoDBClient = new DynamoDBClient({ region: "ap-northeast-1" });
  const sqsClient = new SQSClient({ region: "ap-northeast-1" });
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  console.log(`Bucket: ${bucketName}`);
  console.log(`Object Key: ${objectKey}`);
  if (!objectKey.endsWith(".csv")) {
    console.log("Not a CSV file.  Exiting.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Not a CSV file.  No action taken." })
    };
  }
  try {
    const fileId = objectKey.split("/").pop().replace(".csv", "");
    console.log(`Extracted file ID: ${fileId}`);
    const tableName = "upload-csv";
    await updateStatusToUploaded(dynamoDBClient, tableName, fileId);
    const sqsParams = {
      QueueUrl: "https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue",
      MessageBody: JSON.stringify({ fileId })
    };
    await sendMessageToQueueSQS(sqsClient, sqsParams);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Successfully processed file: ${objectKey}` })
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error.message })
    };
  }
}
export {
  handler
};
