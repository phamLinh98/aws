export async function handler(event) {
    try {
        const fileId = event.queryStringParameters?.fileId;
        const apiUrl = 'https://kb3nzijkv2.execute-api.ap-northeast-1.amazonaws.com/update-batch';
        const response = await fetch(`${apiUrl}?fileId=${fileId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
        }

        const responseData = await response.json();
        console.log('API response:', responseData);
    } catch (apiError) {
        console.error('Error calling API Gateway:', apiError);
        throw apiError;
    }
    console.log(`ahihi`);
}
