export const handler = async (event) => {
    const resizeAvatarUrl = 'https://xacl1f6bdd.execute-api.ap-northeast-1.amazonaws.com/resize-avatar';
    const updateStatusUrl = 'https://xacl1f6bdd.execute-api.ap-northeast-1.amazonaws.com/update-status';

    console.log('resizeAvatarUrl', resizeAvatarUrl);
    console.log('updateStatusUrl', updateStatusUrl)

    try {
        // Call the resize avatar API
        await fetch(resizeAvatarUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Debugging
        console.log('1. resize Avatar API called');

        // Call the update status API
        await fetch(updateStatusUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Debugging
        console.log('2. updateStatus API called');

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'APIs called successfully'
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error calling APIs',
                error: error.message
            })
        };
    }
};