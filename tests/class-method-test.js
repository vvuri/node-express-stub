import chai from 'chai';
import chaiHtml from 'chai-html';
import StaticServer from '../dist/fs_server';
import { testConfig } from './helper';

chai.use(chaiHtml);
//chai.use(require('chai-dom'));

const assert = chai.assert;
const expect = chai.expect;

describe('class unit test', () => {
    // _getHTMLDirList (subdir, listFiles)
    // - формирование кода по шаблону
    // - разбор что число открытых и закрытых теког соответсвует
    // - запуск при пустом значении
    let srv;

    before( () => {
        srv = new StaticServer(testConfig);
    });

    it(`Запуск функции с пустыми параметрами`, () => {
        const result = srv._getHTMLDirList('', '');

        expect(result).html.to.equal(`<h2>List Files in <i>${testConfig.ROOT_DIR}</i>:</h2><ul></ul>`);
    });

    it(`Проверка списка для корневой директории`, () => {
        const listAnchors = ['a11', 'a2', 'a3'];
        const result = srv._getHTMLDirList('/', listAnchors);

        expect(result).html.to.contain('<h2>List Files', 'Header as H2');
        expect(result).html.to.contain(`<i>${testConfig.ROOT_DIR}/</i>`, 'Header contains name of root directory');

        for (const anchor of listAnchors) {
            expect(result).html.to.contain(`<A href="http://${testConfig.HOST}:${testConfig.PORT}/${anchor}">`, `Anchor ${anchor} are represents`);
            expect(result).html.to.contain(`<li> ${anchor}`, `List file contain a name file`);
        }
    });

    it(`Пустой список файлов`, () => {
        const result = srv._getHTMLDirList('/private/', []);

        console.log(result);
    });

    it(`субдиректораия  - формирование анкера`, () => {
        const result = srv._getHTMLDirList('/private/', ['a1']);

        console.log(result);
    });

});
