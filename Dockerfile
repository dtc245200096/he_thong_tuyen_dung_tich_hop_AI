FROM node:20-alpine

WORKDIR /app

# Cài đặt các thư viện cần thiết cho việc xử lý văn bản và kiểm thử
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Tạo thư mục uploads
RUN mkdir -p uploads/cvs uploads/invoices

EXPOSE 3000

CMD ["npm", "start"]
