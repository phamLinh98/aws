- Hê thống sử dụng S3, Lambda, SQS, DynamoDb để lưu dữ thông tin user cập nhật từ file csv và lưu vào Database


Step 1: Tạo 1 S3 bucket tên là upload-image
Upload file csv lên S3 , file csv được lưu thành công vào S3
    Sample file csv:
    ```
    name,age,avatar
    "Nguyen Van A", 20, "https://avatar.com/1"
    "Nguyen Van B", 21, "https://avatar.com/2"
    ```

Step 2: S3 trigger Lambda function lưu thông tin tên, id user vào DynamoDb
    2.1: Upsert thông tin user vào DynamoDb với key là name và age 
    vào bảng user

    Sample data:
    ```
    {
        "id": "1",
        "name": "Nguyen Van A",
        "age": 20,
        "avatar": "https://avatar.com/1",
        "batchId": "1"
    }
    {
        "id": "2",
        "name": "Nguyen Van B",
        "age": 21,
        "avatar": "https://avatar.com/2",
        "batchId": "1"
    }
    ```
    2.2: Tạo 1 record để thực hiện chạy batch job và lưu vào bảng upload_status
    ```
    {
        "id": "1",
        "status": "pending"
    }
    ```

Step 3: Lamdba function gửi 1 message vào sqs với thông tin user

    Sample message:
    ```
    {
        "batchId": "1"
    }
    ```

Step 4: Tạo 1 lambda có tên là RouterLambda
    - Lambda RouterLambda sẽ lắng nghe message từ sqs, khi có new message thì sẽ gọi tới api gateway
    api gate way sẽ public 2 api cho 2 lambda function sau 
    -- lambda 1: lấy ảnh tên linh.png từ upload-image và lưu vào bucket mới có tên resized-image
    -- lambda 2: sẽ truy cập vào dynamoDB bảng user và thay đổi nội dung trường avatar thành linh.png

tôi có 1 yêu cầu như sau :

Step 4: Tạo 1 lambda có tên là RouterLambda
    - Lambda RouterLambda sẽ lắng nghe message từ sqs, khi có new message thì sẽ gọi tới api gateway
    api gate way sẽ public 2 api cho 2 lambda function sau 
    -- lambda 1: lấy ảnh tên linh.png từ upload-image và lưu vào bucket mới có tên resized-image
    -- lambda 2: sẽ truy cập vào dynamoDB bảng user và thay đổi nội dung trường avatar thành linh.png

tôi đã tạo 1 lambda 1 có arn: arn:aws:lambda:ap-northeast-1:650251698778:function:linhclass-call-lambda-route-lambda
tên lambda là : linhclass-call-lambda-route-lambda

Hãy tạo cho tôi 2 lambda function 
lambda RouterLambda và lambda 2( lấy tên là linhclass-change-avatar-lambda) và 2 api gateway để thực hiện yêu cầu trên