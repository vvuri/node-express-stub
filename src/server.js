import StaticServer from './fs_server';

const StartServer = async () => {
    const args = {
        host:    '127.0.0.1',
        port:    '8888',
        rootDir: 'public',
        dirPath: ['/', '/elements', '/elements/subelements']
    };
    const srv = new StaticServer(args);

    await srv.start();

    // const test = { host: '127.0.0.1', port: '9999', rootDir: 'public/elements', dirPath: ['/', '/subelements'] };
    // const srv2 = new StaticServer(test);
    //
    // await srv2.start();
};

StartServer();
