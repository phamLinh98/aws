import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

export const checkTableIfExistElseCreate = async (dynamodb, tableName) => {
    const params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
        ],
        AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
    };

    try {
        await dynamodb.send(new CreateTableCommand(params));
    } catch (err) {
        if (err.name !== 'ResourceInUseException') {
            throw err;
        }
    }
}