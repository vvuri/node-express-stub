import StaticServer from './fs_server';

const startServer = async () => {
    const args = {
        host:              '127.0.0.1',
        port:              '8888',
        rootDir:           'public',
        maxUploadFileSize: '10'
    };
    const srv = new StaticServer(args);

    srv.start();
};

startServer();
