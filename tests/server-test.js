import chai from 'chai';
import { createRequester, getClearConfig, testConfig } from './helper';
import StaticServer from '../src/fs_server';

const assert = chai.assert;

describe('Request chai-http test:', () => {
    let srv;
    let requester;

    before(async () => {
        getClearConfig();
        requester = createRequester();
        srv = new StaticServer(testConfig);

        await srv.start();
    });

    it('Positive: Get root list of files - body size 553 bytes', async () => {
        const res = await requester.get('/');

        assert.equal(res.header['content-length'] > 550, true);
        requester.close();
    });

    let runs = [
        { it: 'root', options: { dir: '/' } },
        { it: 'subdir', options: { dir: '/elements' } },
        { it: 'subsubdir', options: { dir: '/elements/subelements' } }
    ];

    runs.forEach(run => {
        it(`Positive: Get sub directory ${run.it} list of files`, async () => {
            const res = await requester.get(run.options.dir);

            assert.equal(res.status, 200);
            assert.equal(res.header['content-type'], 'text/html');
            requester.close();
        });
    });

    runs = [
        { it: 'Table_htm.Htm', options: { dir: '/', name: 'Table_htm.htm', contenttype: 'text/html; charset=UTF-8' } },
        { it: 'line.png', options: { dir: '/elements/', name: 'line.png', contenttype: 'image/png' } },
        { it: 'text.txt', options: { dir: '/elements/', name: 'text.txt', contenttype: 'text/plain; charset=UTF-8' } },
        {
            it:      'logo2.svg',
            options: { dir: '/elements/subelements/', name: 'logo2.svg', contenttype: 'image/svg+xml' }
        },
    ];

    runs.forEach(run => {
        it(`Positive: Get file ${run.it} from ${run.options.dir}`, async () => {
            const res = await requester.get(run.options.dir + run.options.name);

            assert.equal(res.status, 200);
            assert.equal(res.header['content-type'], run.options.contenttype);
            requester.close();
        });
    });

    it('Negative: File Table.html not found', async () => {
        const res = await requester.get('/Table.html');

        assert.equal(res.status, 404);
        requester.close();
    });

    it('Negative: notexist directory not found', async () => {
        const res = await requester.get('/elementas/notexist/');

        assert.equal(res.status, 404);
        assert.equal(srv.isRunning, true);
        requester.close();
    });

    after(async () => {
        requester.close();
        await srv.stop();
    });
});
