import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ region: 'ap-northeast-1' });

export async function handler(event) {
    const bucketName = 'linhclass-csv-bucket';
    const nameFIle = '58af4f39-a8cb-480e-98fe-61eb9ac3dcc2';
    const keyName = `csv/${nameFIle}.csv`;

    try {
        const params = {
            Bucket: bucketName,
            Key: keyName,
        };

        // Use GetObjectCommand to fetch the object
        const command = new GetObjectCommand(params);
        const data = await s3.send(command);

        // Convert the stream to a string
        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            });

        const csvString = await streamToString(data.Body);

        // Convert CSV string to JSON
        const lines = csvString.split('\n');
        const headers = lines[0].split(',');
        const jsonData = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            for (let i = 0; i < headers.length; i++) {
                obj[headers[i].trim()] = values[i] ? values[i].trim() : null;
            }
            return obj;
        });

        console.log('jsonData', jsonData);

        //         jsonData đang trả về 

        //   {
        //     "id": "1",
        //     "name": "Izuka",
        //     "age": "25",
        //     "avatar": "clone",
        //     "salary": "1000",
        //     "position": "employee"
        //   },
        //   {
        //     "id": "2",
        //     "name": "Rin",
        //     "age": "24",
        //     "avatar": "clone",
        //     "salary": "1000",
        //     "position": "employee"
        //   }
        // ]

        //TODO: bổ sung các trường từ có trong jsonData (name, age, avatar, salary, position)  vào bảng upload-csv  trên dynamoDB và tại id = nameFIle thì cập nhât status thành InsertSuccess
        //TODO: chú ý chỉ bổ sung trường chứ không thêm dữ liệu cho trường (trừ status)
        
        const response = {
            statusCode: 200,
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return response;

    } catch (error) {
        console.error('Lỗi khi đọc file CSV từ S3:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Lỗi khi đọc file CSV từ S3.' }),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    }
};