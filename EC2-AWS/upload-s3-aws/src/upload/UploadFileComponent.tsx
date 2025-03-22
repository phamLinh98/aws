import { useState, useEffect } from 'react';
import { Button, Card, Input, notification } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { fetchApiAws } from '../api/FetchApiUrl';
import { fetchApiGetStatus } from '../api/FetchApiGetStatus';

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

    const status = 'Uploading';
    const times = 0;
    
    // const [statusData, setStatusData] = useState<any>(undefined);

    // useEffect(() => {
    //     const getStatus = async () => {
    //         try {
    //             const statusResponse = await fetchApiGetStatus();
    //             setStatusData(statusResponse);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
    //     getStatus();
    // }, []);

    // console.log('statusData', statusData);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contextHolder}
            <Input type="file" onChange={uploadCsvFromPC} />
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <Card title="Upload-status" variant="borderless" style={{ width: 300 }}>
                    <p>Status: {status}</p>
                    <p>CallAPI: {times}</p>
                </Card>
            </div>
        </div>
    );
};

export default UploadFileComponent;