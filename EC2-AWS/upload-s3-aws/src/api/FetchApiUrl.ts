export const fetchApiAwsGetUrlAndIdFromS3 = async (file: any, pushNotification: any, setId: any) => {
    try {
        const response = await fetch('https://1xi5vrb1m0.execute-api.ap-northeast-1.amazonaws.com/get-url');
        if (!response.ok) {
            throw new Error("Failed to get presigned URL");
        }
        const data_1 = await response.json();
        console.log('data_1', data_1);
        if (!data_1.presignedUrl) {
            throw new Error("Presigned URL not found");
        }
        if (!data_1.id) {
            throw new Error("Id not found");
        }
        setId(data_1.id);//set id /get-status api >> fetchApiAws

        // có preURL thì call api nó để thực hiện PUT file vào S3
        const uploadResponse = await fetch(data_1.presignedUrl, {
            method: 'PUT',
            mode: 'cors',
            body: file, // Sử dụng file thật
            headers: {
                'Content-Type': file.type
            }
        });

        pushNotification('Upload successfully');

        return uploadResponse;
    } catch (error) {
        console.error(error);
        throw error; // Re-throw the error to be caught in the component
    }
}