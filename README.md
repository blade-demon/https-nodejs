#!/bin/bash
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt-get update
sudo apt-get install nginx python-certbot-nginx -y
# 获取https nodejs 服务器
git clone https://github.com/blade-demon/https-nodejs
# 安装nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
# 安装nodejs
nvm install v6
# 安装PM2
npm i -g pm2
# 启动nodejs express服务器
cd /home/ubuntu/https-nodejs && npm i && pm2 start bin/www
# 重启nginx服务
sudo systemctl reload nginx
# 开机启动Nginx服务
sudo systemctl enable nginx
# 开机重启PM2
pm2 startup
# 定期更新SSL证书
sudo su && echo '* * * */2 * root certbot renew' >> /etc/crontab