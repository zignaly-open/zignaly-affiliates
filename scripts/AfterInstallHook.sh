#!/bin/bash

cd /var/www/zignaly-affiliates/server
npm i
sudo chown -R zignaly:zignaly .
sudo -u zignaly pm2 delete affiliates-server || : && sudo -u zignaly NODE_ENV=production pm2 start npm --name "affiliates-server" -- start