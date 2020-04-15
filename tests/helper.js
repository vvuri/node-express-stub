import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiHttp);
chai.use(chaiAsPromised);

export function setClearEnv () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;
}

setClearEnv();

const config = require('../dist/fs_config');
const url = `http://${config.HOST}:${config.PORT}`;

export const requester = chai.request(url).keepOpen();
export const HOST = config.HOST;
export const PORT = config.PORT;
