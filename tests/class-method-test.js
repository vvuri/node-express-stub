import chai from 'chai';
import chaiHtml from 'chai-html';
import StaticServer from '../dist/fs_server';
import { testConfig } from './helper';
import { getListSubDirectories } from '../dist/fs_helper';

chai.use(chaiHtml);

const expect = chai.expect;

describe('StaticServer unit test for methods:', () => {
    let srv;

    before( () => {
        srv = new StaticServer(testConfig);
    });

    describe('_getHTMLDirList()', () => {
        it('should return an empty list if called without arguments', () => {
            const result = srv._getHTMLDirList('', { dirs: '', files: '' });

            expect(result).html.to.contain(`<h2>List Files in <i>${testConfig.rootDir}</i>:</h2><ul></ul>`);
        });

        it('should return an empty list of files for an empty directory', () => {
            const result = srv._getHTMLDirList('/private/', { dirs: [], files: [] });

            expect(result).html.to.contain(`<h2>List Files in <i>${testConfig.rootDir}/private/</i>:</h2><ul></ul>`);
        });

        it(`should return a list of files for the root directory`, () => {
            const listAnchors = { dirs: '', files: ['a11', 'a2', 'a3'] };
            const result = srv._getHTMLDirList('/', listAnchors);

            expect(result).html.to.contain('<h2>List Files', 'Header as H2');
            expect(result).html.to.contain(`<i>${testConfig.rootDir}/</i>`, 'Header contains name of root directory');

            for (const anchor of listAnchors.files) {
                expect(result).html.to.contain(`<A href="http://${testConfig.host}:${testConfig.port}/${anchor}">`, `Anchor ${anchor} are represents`);
                expect(result).html.to.contain(`<li> ${anchor}`, `List file contain a name file`);
            }
        });
    });

    describe('getListSubDirectories()', () => {
        it(`should return a list of subdirectories`, async () => {
            srv.dirPath = await getListSubDirectories(srv.rootDir);

            expect(srv.dirPath).to.be.an('array').to.have.lengthOf(3);
            expect(srv.dirPath).to.eql(['/', '/elements', '/elements/subelements']);
        });
    });
});
