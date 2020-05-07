import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import DomParser from 'dom-parser';

const _Host = '127.0.0.1';
const _Port = '8888';
const _RootDir = 'test/public';
const _dirPath = ['/', '/elements', '/elements/subelements'];

export const testConfig = { host: _Host, port: _Port, rootDir: _RootDir, dirPath: _dirPath };
export const testConfigSecond = { host: _Host, port: '9999', rootDir: 'public/elements', dirPath: ['/', '/subelements'] };

export function getClearConfig () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;

    process.env.PORT     = _Port;
    process.env.HOST     = _Host;
    process.env.ROOT_DIR = _RootDir;
}

export function createRequester (host = _Host, port = _Port) {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    const url = `http://${host}:${port}`;

    return chai.request(url).keepOpen();
}

export function parseLiList (text) {
    const parser = new DomParser();
    const parseDoc = parser.parseFromString(text, 'text/html');

    return parseDoc.getElementsByTagName('li').map(
        item => {
            return item.innerHTML.trim().split(' ')[0];
        });
}

