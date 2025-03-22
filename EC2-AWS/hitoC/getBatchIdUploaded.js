import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function handler(event) {
    const s3Client = new S3Client({ region: 'ap-northeast-1' });
    const bucketName = 'linhclass-csv-bucket';

    try {
        const params = {
            Bucket: bucketName,
        };

        // List objects in the bucket
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);

        if (data.Contents && data.Contents.length > 0) {
            // Filter for CSV files and sort by LastModified in descending order
            const csvFiles = data.Contents
                .filter(file => file.Key.endsWith('.csv'))
                .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

            if (csvFiles.length > 0) {
                // Get the most recent CSV file
                const mostRecentFile = csvFiles[0].Key;
                console.log(`Most recent CSV file: ${mostRecentFile}`);
                return {
                    statusCode: 200,
                    body: JSON.stringify({ fileName: mostRecentFile }),
                };
            } else {
                console.log('No CSV files found in the bucket.');
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'No CSV files found in the bucket.' }),
                };
            }
        } else {
            console.log('No files found in the bucket.');
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No files found in the bucket.' }),
            };
        }
    } catch (error) {
        console.error('Error fetching file name:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}
