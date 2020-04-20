import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

const _Host = '127.0.0.1';
const _Port = '8888';
const _RootDir = 'public';

export const testConfig = { HOST: _Host, PORT: _Port, ROOT_DIR: _RootDir };

export function getClearConfig () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;

    process.env.PORT     = _Port;
    process.env.HOST     = _Host;
    process.env.ROOT_DIR = _RootDir;

    require('../dist/fs_config');
}

export function createRequester () {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    const config = require('../dist/fs_config');

    const url = `http://${config.HOST}:${config.PORT}`;

    return chai.request(url).keepOpen();
}

