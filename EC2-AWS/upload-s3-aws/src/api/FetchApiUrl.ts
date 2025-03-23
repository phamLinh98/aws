export const fetchApiAws = async (file: any, pushNotification: any, status:any="Upload file đầu tiên") => {
    try {
        if(!status){
            pushNotification('Upload file đầu tiên');
        }
        pushNotification(status);
        const response = await fetch('https://svjv2nnex6.execute-api.ap-northeast-1.amazonaws.com/get-url');
        if (!response.ok) {
            throw new Error("Failed to get presigned URL");
        }
        const data_1 = await response.json();
        if (!data_1.presignedUrl) {
            throw new Error("Presigned URL not found");
        }

        // Upload file to S3
        if(!status){
            pushNotification('Upload file đầu tiên');
        }
        pushNotification(status);

        const uploadResponse = await fetch(data_1.presignedUrl, {
            method: 'PUT',
            mode: 'cors',
            body: file, // Sử dụng file thật
            headers: {
                'Content-Type': file.type
            }
        });

        if(!status){
            pushNotification('Upload thành công file đầu tiên');
        }
        pushNotification(status);
        
        return uploadResponse;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error to be caught in the component
    }
}