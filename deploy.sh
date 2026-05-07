#!/bin/bash

# 项目部署脚本
echo "开始部署项目..."

# 1. 更新系统
echo "1. 更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装依赖
echo "2. 安装依赖..."
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# 3. 设置Node.js版本
echo "3. 设置Node.js版本..."
sudo npm install -g n
sudo n stable

# 4. 克隆项目（如果需要）
# git clone <your-repo-url>
# cd biyesheji

# 5. 安装项目依赖
echo "5. 安装项目依赖..."
npm install

# 6. 构建前端
echo "6. 构建前端..."
npm run build

# 7. 配置Nginx
echo "7. 配置Nginx..."
sudo rm /etc/nginx/sites-enabled/default

cat > /etc/nginx/sites-available/biyesheji << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/your/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/biyesheji /etc/nginx/sites-enabled/

# 8. 重启Nginx
echo "8. 重启Nginx..."
sudo systemctl restart nginx

# 9. 获取SSL证书
echo "9. 获取SSL证书..."
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 10. 设置后端服务为系统服务
echo "10. 设置后端服务..."
cat > /etc/systemd/system/biyesheji-backend.service << 'EOF'
[Unit]
Description=Biyesheji Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project/backend
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable biyesheji-backend
sudo systemctl start biyesheji-backend

echo "部署完成！"
echo "请确保："
echo "1. 修改 /etc/nginx/sites-available/biyesheji 中的域名和路径"
echo "2. 修改 /etc/systemd/system/biyesheji-backend.service 中的路径"
echo "3. 确保域名解析指向服务器IP"
