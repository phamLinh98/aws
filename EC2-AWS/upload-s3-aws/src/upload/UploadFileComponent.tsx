import { useState, useRef } from 'react';
import { Button, Input, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { fetchApiAws } from '../api/FetchApiAws';

export const UploadFileComponent = () => {
    const [api, contextHolder] = notification.useNotification();
    const [selectedFile, setSelectedFile] = useState(null);
    const message = useRef<string[]>([]);
    const [uploading, setUploading] = useState(false);

    //Upload CSV
    const uploadCsvFromPC = (event: any) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    // Toast
    const openNotification = (newMessage: string) => {
        api.open({
            message: 'Upload Status',
            description: newMessage,
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
            message.current.length = 0; // Reset message array

            message.current.push('1. Uploading file...');
            message.current.push('2. Presigned URL is received...');
            message.current.push('3. File Upload to S3 Successful');

            // Hiển thị từng message cách nhau 1 giây
            for (let i = 0; i < message.current.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây
                openNotification(message.current[i]);
            }

            await fetchApiAws(selectedFile); // Gọi fetchApiAws sau khi hiển thị tất cả message

            setSelectedFile(null);

        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            message.current.length = 0; // Reset message array
            message.current.push(`Upload failed: ${errorMessage}`);
            openNotification(message.current[0]); // Hiển thị thông báo lỗi
            notification.error({ message: `Upload failed: ${errorMessage}` });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {contextHolder}
            <Input type="file" onChange={uploadCsvFromPC} />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </Button>
        </div>
    );
};

export default UploadFileComponent;