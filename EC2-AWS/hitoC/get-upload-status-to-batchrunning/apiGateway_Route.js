export async function handler(event) {
    console.log('Full event:', JSON.stringify(event, null, 2)); // In toàn bộ event để debug
    console.log('event.queryStringParameters', event.queryStringParameters); // In queryStringParameters
    const fileId = event.queryStringParameters?.fileId;
    console.log('fileId', fileId);
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Received fileId: ' + fileId }),
    };
}