import chai from 'chai';
import chaiHtml from 'chai-html';
import StaticServer from '../dist/fs_server';
import { testConfig } from './helper';

chai.use(chaiHtml);

const expect = chai.expect;

describe('StaticServer unit test for method _getHTMLDirList:', () => {
    let srv;

    before( () => {
        srv = new StaticServer(testConfig);
    });

    const runs = [
        { it: 'Starting a method with empty parameters', subdir: '', listfiles: { dirs: '', files: '' }, result: `<h2>List Files in <i>${testConfig.rootDir}</i>:</h2><ul></ul>` },
        { it: 'Return empty list of files in subdirectory', subdir: '/private/', listfiles: { dirs: '', files: [] }, result: `<h2>List Files in <i>${testConfig.rootDir}/private/</i>:</h2><ul></ul>` },
        { it: 'Return empty list of files in subdirectory', subdir: '/private/', listfiles: { dirs: [], files: [] }, result: `<h2>List Files in <i>${testConfig.rootDir}/private/</i>:</h2><ul></ul>` }
    ];

    runs.forEach(run => {
        it(run.it, () => {
            const result = srv._getHTMLDirList(run.subdir, run.listfiles);

            expect(result).html.to.equal(run.result);
        });
    });

    it(`The method returns a list of three files for the root directory`, () => {
        const listAnchors = { dirs: ['d1', 'd2'], files: ['a11', 'a2', 'a3'] };
        const result = srv._getHTMLDirList('/', listAnchors);

        expect(result).html.to.contain('<h2>List Files', 'Header as H2');
        expect(result).html.to.contain(`<i>${testConfig.rootDir}/</i>`, 'Header contains name of root directory');

        for (const anchor of listAnchors.files) {
            expect(result).html.to.contain(`<A href="http://${testConfig.host}:${testConfig.port}/${anchor}">`, `Anchor ${anchor} are represents`);
            expect(result).html.to.contain(`<li> ${anchor}`, `List file contain a name file`);
        }
    });

    it(`The method returns a list of two sub directories with tag <b>`, () => {
        const listAnchors = { dirs: ['d1', 'd2'], files: [] };
        const result = srv._getHTMLDirList('/', listAnchors);

        for (const anchor of listAnchors.dirs) {
            expect(result).html.to.contain(`<A href="http://${testConfig.host}:${testConfig.port}/${anchor}">`, `Anchor ${anchor} are represents`);
            expect(result).html.to.contain(`<li> <b>${anchor}</b>`, `List file contain a name file`);
        }
    });
});
