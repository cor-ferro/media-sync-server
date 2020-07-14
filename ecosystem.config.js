module.exports = {
    apps : [{
        name: 'sync-server',
        script: './dist/index.js',
        env: {
            NODE_ENV: 'development',
            DEBUG: 'sync-server*'
        },
        env_production: {
            NODE_ENV: 'production',
            DEBUG: 'sync-server*'
        }
    }]
}
