import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const tableName = "upload-csv"; // Thay bằng tên bảng DynamoDB của bạn

export async function handler(event) {
    console.log('Event:', event);

    const fileId = event.queryStringParameters?.fileId;

    if (fileId) {
        console.log('fileId:', fileId);

        try {
            // Cập nhật status trong DynamoDB
            const updateParams = {
                TableName: tableName,
                Key: {
                    id: { S: fileId }, // Khóa chính (String)
                },
                UpdateExpression: "set #status = :statusValue",
                ExpressionAttributeNames: {
                    "#status": "status",
                },
                ExpressionAttributeValues: {
                    ":statusValue": { S: "BatchRunning" }, // Giá trị String
                },
                ReturnValues: "UPDATED_NEW",
                ConditionExpression: "attribute_exists(id)", // Thêm điều kiện này
            };

            const updateCommand = new UpdateItemCommand(updateParams);
            const updateResponse = await client.send(updateCommand);

            console.log("DynamoDB Update Response:", updateResponse);

            // Trả về response thành công
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'batchRoute executed and DynamoDB updated',
                    fileId: fileId,
                    updateResponse: updateResponse,
                }),
            };

        } catch (dynamoError) {
            console.error("DynamoDB Update Error:", dynamoError);

            // Kiểm tra xem lỗi có phải là vì không tìm thấy bản ghi hay không
            if (dynamoError.name === "ConditionalCheckFailedException") {
                return {
                    statusCode: 404, // Hoặc mã trạng thái phù hợp khác
                    body: JSON.stringify({
                        message: `No item found with id ${fileId}`,
                        error: "ItemNotFound",
                    }),
                };
            }

            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error updating DynamoDB',
                    error: dynamoError.message,
                }),
            };
        }
    } else {
        console.log('fileId không được cung cấp trong query string.');
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'fileId không được cung cấp trong query string.',
            }),
        };
    }
}