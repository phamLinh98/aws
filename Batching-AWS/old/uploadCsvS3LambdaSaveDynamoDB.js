// Lambda Function 1: Handles Step 1 - 3
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import pkg from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const { DynamoDBClient, PutItemCommand } = pkg;

const S3 = new S3Client();
const DynamoDB = new DynamoDBClient();
const SQS = new SQSClient();

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  console.log("Number 1",key);

  const params = {
    Bucket: bucket,
    Key: key
  };

  try {
    const data = await S3.send(new GetObjectCommand(params));
    const csvData = await streamToString(data.Body);
    const users = parseCSV(csvData);
    console.log("Number 2",csvData);

    for (const user of users) {
      const userParams = {
        TableName: "user",
        Item: {
          id: { S: user.id },
          name: { S: user.name },
          age: { N: user.age.toString() },
          avatar: { S: user.avatar },
          batchId: { S: "1" }
        }
      };
      await DynamoDB.send(new PutItemCommand(userParams));
      console.log("Number 3", users);
    }

    const statusParams = {
      TableName: "upload-status",
      Item: {
        id: { S: "1" },
        status: { S: "pending" }
      }
    };
    await DynamoDB.send(new PutItemCommand(statusParams));
    console.log("Number 4",statusParams);

    const sqsParams = {
      MessageBody: JSON.stringify({ batchId: "1" }),
      QueueUrl: "https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-new-message-trigger-lambda-route-queue"
    };
    await SQS.send(new SendMessageCommand(sqsParams));
    console.log("Number 5");

    return { statusCode: 200, body: "Success" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error" };
  }
};

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function parseCSV(csv) {
  const lines = csv.split("\n");
  const result = [];
  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j].trim()] = currentline[j].trim();
    }
    result.push(obj);
  }
  return result;
}