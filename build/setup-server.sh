#!/usr/bin/env bash

$DOMAIN_NAME="pixiplayground.com"

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
mkdir -p /var/www/$DOMAIN_NAME/html
chown deploy:deploy /var/www/$DOMAIN_NAME/html
chmod 755 /var/www/$DOMAIN_NAME
touch /etc/nginx/sites-available/$DOMAIN_NAME
chown deploy:deploy /etc/nginx/sites-available/$DOMAIN_NAME
chmod 644 /etc/nginx/sites-available/$DOMAIN_NAME
# ... fill config ...
ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install Certbot for SSL Cert
add-apt-repository ppa:certbot/certbot
apt install python-certbot-nginx
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME

# Install Node v10.x from nodesource
curl -sL https://deb.nodesource.com/setup_10.x -o /tmp/nodesource_setup.sh
bash /tmp/nodesource_setup.sh
apt install nodejs build-essential
npm install pm2@latest -g
pm2 startup systemd -u deploy --hp /home/deploy
