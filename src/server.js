const srv = require('./fs_server');

async function start () {
    await srv.startServer();
}

start();
