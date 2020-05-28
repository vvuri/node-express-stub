import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';
import DomParser from 'dom-parser';
import fs from 'fs';
import path from 'path';
import { getDirectorySources } from '../dist/fs_helper';

const _Host = '127.0.0.1';
const _Port = '8888';
const _RootDir = 'tests/public';

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

export async function clearDir (subdir, recursive = false) {
    const listFileDir = await getDirectorySources( subdir );

    listFileDir.files.map( async file => {
        await fs.unlink(path.join(subdir, file), err => {
            if (err)
                console.log(`Error deleted file: ${file}, err.message`);
        });
    });

    if (recursive) {
        await listFileDir.dirs.map( async dir => {
            await clearDir(path.join(subdir, dir), recursive);
        });
    }
}

export async function createTestUploadDir (listDir) {
    await Promise.all(listDir.map( async dirPath => {
        await fs.mkdir(dirPath, () => {});
    }));
}

export async function stopSrv (srv) {
    if (srv.isRunning)
        await srv.stop();
}
