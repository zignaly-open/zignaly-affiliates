#!/bin/bash

cd /var/www/zignaly-affiliates/server
npm i
# Assume it was already started with pm2 start npm --name "affiliates-server" -- start
pm2 restart affiliates-server