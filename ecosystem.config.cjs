module.exports = {
  apps: [
    {
      name: 'toyo-reservations',
      script: 'tsx',
      args: 'daemon.ts',
      interpreter: 'none',
      watch: false,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
