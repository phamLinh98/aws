// index.js
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// createGenerateUUID.js
var generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};

// createTableUploadStatusIfNotExist.js
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
var checkTableIfExistElseCreate = async (dynamodb, tableName) => {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  try {
    await dynamodb.send(new CreateTableCommand(params));
  } catch (err) {
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
};

// createPreSignedUrl.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var createPresignedUrl = async (s3Client2, bucketName, objectKey, expiration, fileName) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: "text/csv"
    });
    const presignedUrl = await getSignedUrl(s3Client2, command, { expiresIn: expiration });
    console.log("4. presignedUrl:", presignedUrl);
    return {
      statusCode: 200,
      body: JSON.stringify({
        presignedUrl,
        id: fileName
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi t\u1EA1o presigned URL" })
    };
  }
};

// index.js
var s3Client = new S3Client({ region: "ap-northeast-1" });
async function handler(event) {
  const bucketName = "linhclass-csv-bucket";
  const fileName = generateUUID();
  const dynamodb = new DynamoDBClient({ region: "ap-northeast-1" });
  const tableName = "upload-csv";
  await checkTableIfExistElseCreate(dynamodb, tableName);
  console.log("1. Check table exist");
  await dynamodb.send(new PutItemCommand({
    TableName: tableName,
    Item: {
      id: { S: fileName },
      status: { S: "Uploading" },
      createdAt: { N: Date.now().toString() }
    }
  }));
  console.log("2. Saved to dynamodb");
  const objectKey = "csv/" + fileName + ".csv";
  const expiration = 3600;
  console.log("3. objectKey:", objectKey);
  const data = await createPresignedUrl(s3Client, bucketName, objectKey, expiration, fileName);
  return data;
}
export {
  handler
};
