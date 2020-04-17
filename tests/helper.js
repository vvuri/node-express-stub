import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

const testHost = '127.0.0.1';
const testPort = '8888';
const testRootDir = 'public';

export const config = { HOST: testHost, PORT: testPort, ROOT_DIR: testRootDir };

export function setDefaultEnv () {
    process.env.PORT = testPort;
    process.env.HOST = testHost;
    process.env.ROOT_DIR = testRootDir;
}

function createRequesterDefault () {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    const url = `http://${config.HOST}:${config.PORT}`;
    const requester = chai.request(url).keepOpen();

    console.log(`Req url: ${url}`);

    return requester;
}

export const requester = createRequesterDefault();
