# Docker

## Image là gì?

Image là một file chứa tất cả các thứ cần thiết để tạo ra một container. Image bao gồm một hệ điều hành, một môi trường chạy ứng dụng, các thư viện, các biến môi trường, các file cấu hình, các file dữ liệu, các file thực thi, ...

## Container là gì?

Container là một thực thể (instance) của một image. Container chứa tất cả các thứ cần thiết để chạy ứng dụng. Container có thể được tạo ra, khởi động, dừng, xóa, ...

### Image và Container khác nhau như thế nào?

Image là một file, container là một thực thể. Image chứa tất cả các thứ cần thiết để tạo ra một container. Container chứa tất cả các thứ cần thiết để chạy ứng dụng.

## Dockerfile là gì?

Dockerfile là một file chứa các hướng dẫn để tạo ra một image. Dockerfile bao gồm các lệnh cơ bản như `FROM`, `RUN`, `COPY`, `CMD`, `ENTRYPOINT`, ...

```dockerfile
# Dockerfile
FROM ubuntu:latest
RUN apt-get update
# install apache2
RUN apt-get install -y apache2
# copy index.html
COPY index.html /var/www/html/
CMD ["apache2ctl", "-D", "FOREGROUND"]
```

## Docker Compose là gì?

Docker Compose là một công cụ giúp chúng ta quản lý nhiều container cùng một lúc. Docker Compose sử dụng file `docker-compose.yml` để cấu hình các container.

```yaml
# docker-compose.yml
version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"

  backend:
    image: node:latest
    volumes:
      - ./backend:/app

  db:
    image: mysql:latest
    environment:
      MYSQL_ROOT_PASSWORD: password
```

---
TODO: 

## Cluster là gì?

Cluster là một nhóm các máy chủ (server) hoạt động cùng nhau như một máy chủ duy nhất. Cluster giúp tăng tính sẵn sàng, tăng hiệu suất, giảm thiểu rủi ro, ...

### Cluster và Dock compose khác nhau như thế nào?

Docker Compose quản lý nhiều container trên một máy chủ duy nhất. Cluster quản lý nhiều container trên nhiều máy chủ.