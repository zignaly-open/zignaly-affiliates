#!/bin/bash

exec 3>&1 4>&2
trap 'exec 2>&4 1>&3' 0 1 2 3
exec 1>/home/debug.log 2>&1
cd /var/www/zignaly-affiliates/server
# npm i
# pm2 delete affiliates-server || : &&  pm2 start npm --name "affiliates-server" -- start