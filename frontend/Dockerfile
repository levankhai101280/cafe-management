# Giai đoạn 1: Build React App
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Serve bằng Nginx
FROM nginx:1.23-alpine
COPY --from=build /app/build /usr/share/nginx/html

# SỬA DÒNG NÀY: Dùng tên file khác (không dùng default.conf)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/cafe.conf 

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]