- Hê thống sử dụng S3, Lambda, SQS, DynamoDb để lưu dữ thông tin user cập nhật từ file csv và lưu vào Database


Step 1: Upload file csv lên S3 , file csv được lưu thành công vào S3
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
Step 4: Tạo 1 lambda có tên là RouterLambda dùng để lần lượt gọi các lambda sau :
    - Update status batch job: Cập nhật status của update_status thành processing. OK
    - Lambda Resize Avatar: Các user có batchId trùng với batchId nhận từ sqs sẽ được resize avatar và lưu vào S3 bucket tên resize avatar - X
     - Lambda Create User Login: Các user có batchId trùng với batchId nhận từ sqs sẽ được tạo thêm 2 trường là username: name của user và password: 123 và lưu vào DynamoDB
    - Update status batch job: Cập nhật status của update_status thành done.