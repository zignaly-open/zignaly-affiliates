Run in dev mode:
- `cd client && yarn && yarn start`
- `cd server && npm i && npm start`

Deploying the backend:
- clone the code
- install node v14  
- `npm install pm2 yarn -g`  
- create (copy) `client/.env` and `server/.env` files (you'll need the db, of course)
- `cd server && npm i`
- `npm start` or, using pm2: `pm2 start npm --name "affiliates-server" -- start`
- `cd client && yarn && yarn build`

Nginx config:
```
server {
    listen 443 ssl;
    listen [::]:443;
    server_name affiliate.zignaly.com;
    root /var/www/zignaly-affiliates/client;
    add_header 'Access-Control-Allow-Origin' $http_origin;
    add_header 'Access-Control-Allow-Credentials' 'true'; 
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With';
    ssl_certificate /etc/ssl/certs/zignaly-bundle.crt;
    ssl_certificate_key /etc/ssl/private/zignaly-key.key; 
  
    if ($request_method = 'OPTIONS') {
        return 204;
    }
  
    location / {
        try_files $uri /index.html;
    }
    
    location ~ ^/(api|r)/.* {
        proxy_pass http://127.0.0.1:7777$uri$is_args$args;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host; 
        proxy_set_header  X-Real-IP  $remote_addr;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 100M;
    }
}

server {
    listen 80;
    server_name affiliate.zignaly.com;
    return 301 https://affiliate.zignaly.com$request_uri;
}

```

Cron:
```
12 */2 * * * cd /var/www/zignaly-affiliates/server && npm run cron
0 0 1 * * cd /var/www/zignaly-affiliates/server && npm run cron-payout
```


