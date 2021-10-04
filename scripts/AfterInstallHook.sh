#!/bin/bash

cd /var/www/zignaly-affiliates/server
npm i
pm2 delete affiliates-server || : &&  pm2 start npm --name "affiliates-server" -- start