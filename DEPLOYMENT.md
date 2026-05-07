# 项目部署指南

## 环境要求

- 操作系统：Ubuntu 20.04 / 22.04 LTS
- Node.js：18.x 或更高版本
- Nginx：用于反向代理和SSL
- 域名（可选但推荐）

## 部署步骤

### 1. 登录服务器

```bash
ssh username@your-server-ip
```

### 2. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2（进程管理器）
sudo npm install -g pm2
```

### 3. 上传项目文件

使用 FTP 或 SCP 将项目文件上传到服务器，例如：

```bash
scp -r /path/to/local/project/* username@your-server-ip:/var/www/biyesheji/
```

### 4. 安装项目依赖

```bash
cd /var/www/biyesheji
npm install
```

### 5. 构建前端

```bash
npm run build
```

### 6. 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/biyesheji
```

粘贴以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/biyesheji/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
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
```

启用配置并重启 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/biyesheji /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### 7. 配置 SSL（推荐）

安装 Certbot 并获取 SSL 证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. 启动后端服务

使用 PM2 启动后端服务：

```bash
cd /var/www/biyesheji/backend
pm2 start index.js --name biyesheji-backend
```

设置开机自启：

```bash
pm2 save
pm2 startup
```

### 9. 验证部署

访问你的域名即可查看项目：
- 主页面：https://your-domain.com
- 管理员页面：https://your-domain.com/admin

## 管理命令

### 查看后端日志

```bash
pm2 logs biyesheji-backend
```

### 重启后端服务

```bash
pm2 restart biyesheji-backend
```

### 停止后端服务

```bash
pm2 stop biyesheji-backend
```

### 查看 Nginx 日志

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 注意事项

1. **安全组配置**：确保服务器安全组开放了 80 和 443 端口
2. **域名解析**：确保域名已正确解析到服务器 IP
3. **文件权限**：确保项目目录权限正确
4. **数据备份**：定期备份 `backend/` 目录下的 JSON 文件

## 故障排查

### 问题1：前端页面无法访问

检查 Nginx 配置和日志：
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### 问题2：API 请求失败

检查后端服务状态和日志：
```bash
pm2 status
pm2 logs biyesheji-backend
```

### 问题3：SSL 证书问题

检查 Certbot 日志：
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 项目结构

```
biyesheji/
├── dist/                 # 前端构建产物
├── src/                  # 前端源代码
├── backend/              # 后端代码
│   ├── index.js          # 入口文件
│   ├── conversations.json # 对话数据
│   ├── users.json        # 用户数据
│   ├── feedbacks.json    # 反馈数据
│   └── admin_users.json  # 管理员数据
├── package.json          # 项目依赖
├── vite.config.js        # Vite 配置
└── deploy.sh             # 部署脚本
```
