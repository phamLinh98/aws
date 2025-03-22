import { useState, useEffect } from 'react';
import { Button, Input, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { fetchApiAws } from '../api/FetchApiAws';

export const UploadFileComponent = () => {
    const [api, contextHolder] = notification.useNotification();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [notificationMes, setNotificationMes] = useState<any>(undefined);

    useEffect(() => {
        if (notificationMes !== undefined) {
        }
    }, [notificationMes]);

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

            await fetchApiAws(selectedFile, openNotification); // Gọi fetchApiAws sau khi hiển thị tất cả message

            openNotification('File uploaded successfully.');

            setSelectedFile(null);

        } catch (error) {

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