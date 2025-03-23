export const fetchApiGetStatus = async () => {
    try {
        const response = await fetch('https://svjv2nnex6.execute-api.ap-northeast-1.amazonaws.com/get-status');
        if (!response.ok) {
            throw new Error("Failed to get upload status csv");
        }
        const uploadResponse = await response.json();
        return uploadResponse;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error to be caught in the component
    }
}