import StaticServer from './fs_server';

const StartServer = async () => {
    const args = {
        host:    '127.0.0.1',
        port:    '8888',
        rootDir: 'public',
        dirPath: ['/', '/elements', '/elements/subelements']
    };
    const srv = new StaticServer(args);

    setTimeout(async () => {
        await srv.start();
    }, 1000);
};

StartServer();
