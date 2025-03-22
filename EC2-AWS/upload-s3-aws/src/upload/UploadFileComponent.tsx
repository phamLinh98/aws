import { useState, useEffect } from 'react';
import { Button, Card, Input, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { fetchApiAws } from '../api/FetchApiUrl';
import { useFacadeUpload } from '../redux/useFacadeUpload';
import CountDown from './CountDown';

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

    const { listUpload } = useFacadeUpload();

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

            await fetchApiAws(selectedFile, openNotification, listUpload.status); // Gọi fetchApiAws sau khi hiển thị tất cả message
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <Card title="Upload-status" variant="borderless" style={{ width: 300 }}>
                    <p>UUID: {listUpload?.uuid || '0'}</p>
                    <p>Status: {listUpload?.status || '0'}</p>
                </Card>
            </div>
        </div>
    );
};

export default UploadFileComponent;