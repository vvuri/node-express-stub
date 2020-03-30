const mocha = require('mocha');
const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
const chaiHttp = require('chai-http');
const app = require('../dist/fs_server');

chai.use(chaiAsPromised);
chai.use(chaiHttp);

const server = 'http://127.0.0.1:8888';

describe('Request chai-http test:', () => {
    it('Positive: Get root list of files - body size 602 bytes', () => {
        const requester = chai.request(server).keepOpen();

        Promise.all([requester.get('/')])
            .then( values => {
                let [res, err] = values;

                assert.equal(res.header['content-length'], '602');
            })
            .then(() => requester.close());
    });

    let runs = [
        {it: 'root', options: {dir: '/'}},
        {it: 'subdir', options: {dir: '/elements'}},
        {it: 'subsubdir', options: {dir: '/elements/subelements'}},
    ];
    runs.forEach(function (run, idx) {
        it(`Positive: Get sub directory ${run.it} list of files`, () => {
            const requester = chai.request(server).keepOpen();

            Promise.all([requester.get(run.options.dir)])
                .then(values => {
                    let [res, err] = values;

                    assert.equal(res.status, 200);
                    assert.equal(res.header['content-type'], 'text/html');
                })
                .then(() => requester.close());
        });
    });

    runs = [
        {it: 'Table_htm.Htm', options: {dir: '/', name: 'Table_htm.htm', contenttype: 'text/html'}},
        {it: 'line.png', options: {dir: '/elements/', name: 'line.png', contenttype: 'image/png'}},
        {it: 'text.txt', options: {dir: '/elements/', name: 'text.txt', contenttype: 'text/plain'}},
        {it: 'logo2.svg', options: {dir: '/elements/subelements/', name: 'logo2.svg', contenttype: 'image/svg+xml'}},
    ];
    runs.forEach(function (run, idx) {
        it(`Positive: Get file ${run.it} from ${run.options.dir}`, () => {
            const requester = chai.request(server).keepOpen();

            Promise.all([requester.get(run.options.dir + run.options.name)])
                .then(values => {
                    let [res, err] = values;

                    assert.equal(res.status, 200);
                    assert.equal(res.header['content-type'], run.options.contenttype);
                })
                .then(() => requester.close());
        });
    });


    it('Negative: File Table.html not found', () => {
        const requester = chai.request(server).keepOpen();

        Promise.all([requester.get('/Table.html')])
            .then( values => {
                let [res, err] = values;

                assert.equal(res.status, 404);
            })
            .then(() => requester.close());
    });
});

