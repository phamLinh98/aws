import { DynamoDBClient, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const DYNAMODB_TABLE = "Users";
const AWS_REGION = 'ap-northeast-1';

const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event) => {
    try {
        // Scan the DynamoDB table
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
                        UpdateExpression: "set #position = :position",
                        ExpressionAttributeNames: {
                            "#position": "position",
                        },
                        ExpressionAttributeValues: {
                            ":position": { S: 'employee123' },
                        },
                    };
                    await dynamoDBClient.send(new UpdateItemCommand(updateParams));
                    console.log(`Updated Roles for user with id: ${item.id.S}`);
                } catch (updateError) {
                    console.error(`Error updating Roles for user with id: ${item.id.S}`, updateError);
                }
            }
        } else {
            console.log("No users found in DynamoDB table.");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Roles fields updated successfully." }),
        };
    } catch (error) {
        console.error("Lambda function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error processing request.", error: error.message }),
        };
    }
};