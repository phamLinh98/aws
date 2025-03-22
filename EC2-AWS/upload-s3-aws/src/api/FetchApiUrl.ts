export const fetchApiAws = async (file: any, pushNotification: any) => {
    try {
        const response = await fetch('https://wf3dzxspb0.execute-api.ap-northeast-1.amazonaws.com/get-url');
        if (!response.ok) {
            throw new Error("Failed to get presigned URL");
        }
        const data_1 = await response.json();
        console.log(data_1);
        if (!data_1.presignedUrl) {
            throw new Error("Presigned URL not found");
        }

        // Upload file to S3
        pushNotification('Uploading file...');
        const uploadResponse = await fetch(data_1.presignedUrl, {
            method: 'PUT',
            mode: 'cors',
            body: file, // Sử dụng file thật
            headers: {
                'Content-Type': file.type
            }
        });

        return uploadResponse;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error to be caught in the component
    }
}