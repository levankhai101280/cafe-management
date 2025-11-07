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

# ======================================================
# ⭐️ THÊM DÒNG NÀY VÀO ⭐️
# Xóa config mặc định và thay bằng config của bạn
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# ======================================================

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]