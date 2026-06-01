FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 暴露开发服务器端口
EXPOSE 5173

# 开发模式（热重载）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
