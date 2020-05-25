import chai from 'chai';
import { createRequester, getClearConfig, testConfig } from './helper';
import StaticServer from '../src/fs_server';

const expect = chai.expect;

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

        expect(res.header['content-length'] > 550).to.eql(true);
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

            expect(res.status).to.eql(200);
            expect(res.header['content-type']).to.eql('text/html');
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

            expect(res.status).to.eql(200);
            expect(res.header['content-type']).to.eql(run.options.contenttype);
            requester.close();
        });
    });

    it('Negative: File Table.html not found', async () => {
        const res = await requester.get('/Table.html');

        expect(res.status).to.eql(404);
        requester.close();
    });

    it('Negative: notexist directory not found', async () => {
        const res = await requester.get('/elementas/notexist/');

        expect(res.status).to.eql(404);
        expect(srv.isRunning).to.eql(true);
        requester.close();
    });

    after(async () => {
        requester.close();
        await srv.stop();
    });

    describe('Download tests', () => {
        let result;

        before(async () => {
            result = await requester.get('/elements');
        });

        it('File "styles.css" have links (download) and anchor for download', async () => {
            expect(result.text).to.contain(`<li><A href="http://${testConfig.host}:${testConfig.port}/elements/styles.css">styles.css</A> (<A href="http://${testConfig.host}:${testConfig.port}/elements/styles.css" download>download</A>)</li>`);
        });

        it('Directory "subelements" have only link for open', async () => {
            expect(result.text).to.contain(`<li><A href="http://${testConfig.host}:${testConfig.port}/elements/subelements"><b>subelements</b></A></li>`);
            expect(result.text).to.contain(`<li><A href="http://${testConfig.host}:${testConfig.port}/elements/subelements"><b>subelements</b></A></li>`);
        });
    });
});
