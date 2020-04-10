import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

const _Host = '127.0.0.1';
const _Port = '8888';
const _RootDir = 'public';
const _dirPath = ['/', '/elements', '/elements/subelements'];

export const testConfig = { HOST: _Host, PORT: _Port, ROOT_DIR: _RootDir, dirPath: _dirPath };

export function getClearConfig () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;

    process.env.PORT     = _Port;
    process.env.HOST     = _Host;
    process.env.ROOT_DIR = _RootDir;
}

export function createRequester () {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    const url = `http://${_Host}:${_Port}`;

    return chai.request(url).keepOpen();
}
