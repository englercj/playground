module.exports = {
    apps : [{
        name: 'service',
        script: 'app.js',
        instances: 'max',
        merge_logs: true,
        wait_ready: true,
        listen_timeout: 2000,
        env_production : {
            NODE_ENV: 'production',
            PORT: '3000',
            HOST: '127.0.0.1'
        }
    }]
};
