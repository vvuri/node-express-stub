import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import DomParser from 'dom-parser';

const _Host = '127.0.0.1';
const _Port = '8888';
const _RootDir = 'public';

export const testConfig = { host: _Host, port: _Port, rootDir: _RootDir };

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

export function stopSrv (srv) {
    if (srv.isRunning)
        srv.stop();
}
