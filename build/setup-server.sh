#!/usr/bin/env bash

# Create 'deploy' user that will deploy and run the app
useradd -s /bin/bash -m -d /home/deploy -c "deploy" deploy
#passwd deploy
#usermod -aG sudo deploy

# Install Nginx
apt update
apt install nginx

# Setup firewall rules
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Setup nginx site
mkdir -p /var/www/pixiplayground.com/html
chown deploy:deploy /var/www/pixiplayground.com/html
chmod 755 /var/www/pixiplayground.com
touch /etc/nginx/sites-available/pixiplayground.com
chown deploy:deploy /etc/nginx/sites-available/pixiplayground.com
chmod 644 /etc/nginx/sites-available/pixiplayground.com
# ... fill config ...
ln -s /etc/nginx/sites-available/pixiplayground.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install Certbot for SSL Cert
add-apt-repository ppa:certbot/certbot
apt install python-certbot-nginx
certbot --nginx -d pixiplayground.com -d www.pixiplayground.com

# Install Node v10.x from nodesource
curl -sL https://deb.nodesource.com/setup_10.x -o /tmp/nodesource_setup.sh
bash /tmp/nodesource_setup.sh
apt install nodejs build-essential
npm install pm2@latest -g
pm2 startup systemd -u deploy --hp /home/deploy
