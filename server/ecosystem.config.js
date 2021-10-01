module.exports = {
  apps : [{
    name: "npm",
    cwd: '/var/www/zignaly-affiliates',
    script: "npm",
    args: 'start',
    watch: true,
    env: {
      NODE_ENV: "production",
      HOST: '0.0.0.0',
      PORT: '7777',
    },
  }]
}