

// send message to sqs
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
const sqsClient = new SQSClient({ region: 'ap-northeast-1' });
let sqsParams = {
    QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue',
    MessageBody: JSON.stringify({ fileId }),
};
const sendMessageToQueueSQS = async (sqsClient, sqsParams) => {
    try {
        const sendMessageCommand = new SendMessageCommand(sqsParams);
        const sqsResponse = await sqsClient.send(sendMessageCommand);
        console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
    } catch (error) {
        console.error("Error sending message to SQS:", error);
        throw new Error("Failed to send message to SQS");
    }
};

// pull message from sqs
const { ReceiveMessageCommand } = require('@aws-sdk/client-sqs');
sqsParams = {
    QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/650251698778/linhclass-lambda-call-to-queue',
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
};
const receiveMessageFromQueueSQS = async (sqsClient, sqsParams) => {
    try {
        const receiveMessageCommand = new ReceiveMessageCommand(sqsParams);
        const sqsResponse = await sqsClient.send(receiveMessageCommand);
        console.log(`Received messages from SQS: ${JSON.stringify(sqsResponse.Messages)}`);
        return sqsResponse.Messages;
    } catch (error) {
        console.error("Error receiving message from SQS:", error);
        throw new Error("Failed to receive message from SQS");
    }
};

// delete message from sqs
const { DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const deleteMessageFromQueueSQS = async (sqsClient, sqsParams) => {
    try {
        const deleteMessageCommand = new DeleteMessageCommand(sqsParams);
        const sqsResponse = await sqsClient.send(deleteMessageCommand);
        console.log(`Message deleted from SQS with ID: ${sqsResponse.MessageId}`);
    } catch (error) {
        console.error("Error deleting message from SQS:", error);
        throw new Error("Failed to delete message from SQS");
    }
};

const main = async () => {
    // Send message to SQS
    await sendMessageToQueueSQS(sqsClient, sqsParams);

    // Receive message from SQS
    const messages = await receiveMessageFromQueueSQS(sqsClient, sqsParams);
    console.log(`Received messages: ${JSON.stringify(messages)}`);
}

main().catch((error) => {
    console.error("Error in main function:", error);
});