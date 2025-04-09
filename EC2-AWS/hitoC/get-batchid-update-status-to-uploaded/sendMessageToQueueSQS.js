import { SendMessageCommand } from '@aws-sdk/client-sqs';

export const sendMessageToQueueSQS = async (sqsClient, sqsParams) => {
    try {
        const sendMessageCommand = new SendMessageCommand(sqsParams);
        const sqsResponse = await sqsClient.send(sendMessageCommand);
        console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
    } catch (error) {
        console.error('Error sending message to SQS:', error);
        throw new Error('Failed to send message to SQS');
    }
}