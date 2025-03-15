Sơ đồ hệ thống

Step 1: Tạo 1 lambda function gọi tới api gate way, api gateway định nghĩa 3 api route
Step 2: api gateway trigger 1 lambda tên lambda route 
Steo 3: khi lambda route được gọi, nó sẽ gọi tới 2 lambda function khác nhau
 - Lambda function 1: resize avatar
 - Lambda function 2: upload status
Step 3: 2 lambda function thực hiện 2 tác vụ khác nhau