#!/usr/bin/env bash

$DOMAIN_NAME="pixiplayground.com"

# Create 'deploy' user that will deploy and run the app
useradd -s /bin/bash -m -d /home/deploy -c "deploy" deploy
# Upload `~/.ssh/pixi_playground_deploy_rsa.pub` as an authorized key

# Install Nginx
apt update
apt install unzip nginx

# Setup firewall rules
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Setup nginx site
mkdir -p /var/www/$DOMAIN_NAME/html
chown -R deploy:deploy /var/www/$DOMAIN_NAME
chmod 755 /var/www/$DOMAIN_NAME
touch /etc/nginx/sites-available/$DOMAIN_NAME
chown deploy:deploy /etc/nginx/sites-available/$DOMAIN_NAME
chmod 644 /etc/nginx/sites-available/$DOMAIN_NAME
# Copy contents of `server/pixiplayground.com.conf` into `/etc/nginx/sites-available/$DOMAIN_NAME`
ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Install Certbot for SSL Cert
add-apt-repository ppa:certbot/certbot
apt install python3-pip python-certbot-nginx
pip install certbot-dns-cloudflare

# Run certbot to install the certificate
certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME
nginx -t
systemctl restart nginx

# Install Node v10.x and setup pm2
curl -sL https://deb.nodesource.com/setup_10.x -o /tmp/nodesource_setup.sh
bash /tmp/nodesource_setup.sh
apt install nodejs build-essential
npm install pm2@latest -g
pm2 startup systemd -u deploy --hp /home/deploy

# Once the server is setup in cloudflare, you will need to edit /etc/cron.d/certbot to use
# the cloudflare DNS plugin. The command should look like:
certbot renew --dns-cloudflare --dns-cloudflare-credentials /root/.secrets/certbot/cloudflare.ini
# The secrets file should be created that contains the creds. All permissions should be 700 or 600.
