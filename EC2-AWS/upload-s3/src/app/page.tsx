import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function App() {
  return (
    <div>
      <h1>Upload to S3</h1>
      <Upload>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      <Button>Click</Button>
    </div>
  )
}