import { SmileOutlined } from '@ant-design/icons';
import { Button, Card, Input, notification } from 'antd';
import { useState } from 'react';
import { useFacadeUpload } from '../redux/useFacadeUpload';
import { fetchApiAwsGetUrlAndIdFromS3 } from '../api/FetchApiUrl';

export const UploadFileComponent = () => {
    const [api, contextHolder] = notification.useNotification();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [id, setId] = useState(undefined);

    //Từ thông tin id lấy từ api /get-url để gọi api /get-status
    const { status } = useFacadeUpload(id);
    console.log('status', status)

    console.log('id', id);

    //Upload CSV
    const uploadCsvFromPC = (event: any) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    // Toast
    const openNotification = (message: string) => {
        api.open({
            message: message,
            // description: message,
            icon: <SmileOutlined style={{ color: '#108ee9' }} />,
        });
    };

    // Hàm xử lý upload sau khi đã chọn file
    const handleUpload = async () => {
        if (!selectedFile || uploading) {
            if (!selectedFile) {
                notification.error({ message: 'Please select a file first.' });
            }
            return;
        }

        try {
            setUploading(true);

            // Lấy thông tin presignedUrl và id trả về từ việc call api /get-url
            await fetchApiAwsGetUrlAndIdFromS3(selectedFile, openNotification, setId); // Gọi fetchApiAws sau khi hiển thị tất cả message
            setSelectedFile(null);

        } catch (error) {

        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contextHolder}
            <Input type="file" onChange={uploadCsvFromPC} />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            {
                id && status && <Card title="Status" style={{ width: 300 }}>
                    <p>ID: {id}</p>
                    <p>Status: {status}</p>
                </Card>
            }
        </div>
    );
};

export default UploadFileComponent;