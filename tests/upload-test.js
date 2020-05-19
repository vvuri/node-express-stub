import chai from 'chai';
import cheerio from 'cheerio';
import { createRequester, testConfig } from './helper';
import StaticServer from '../src/fs_server';


const expect = chai.expect;

describe.only('Upload tests', () => {
    // upload
    // - в / загрузить - появился
    // - с тем же именем - новое имя
    // - в подкаталог - появился
    // имя файла
    // - один символ
    // - русские буквы
    // - длинное название
    // - с пробелами
    // форматы
    // - набор файлов из public загрузить
    // негативные
    // - лимит размера
    // - сообщение об ошибке
    let srv;
    let requester;

    before(async () => {
        requester = createRequester();
        testConfig.rootDir = 'tests/upload';
        // Clear Upload dir

        srv = new StaticServer(testConfig);
        await srv.start();
    });

    after(async () => {
        requester.close();
        await srv.stop();
    });

    it('Загрузка тестового файла в root', async () => {
        await requester
            .post('/')
            .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
            .then( result => {
                expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/`);
            });
        requester.close();

        // проверка появления файла в списке
        const text = await requester.get('/').content;

        console.log(text);
        const $ = cheerio.load(text);

        console.log($('li'));
        requester.close();
    });

    it('Загрузка файла c тем же именем в root', async () => {

    });

    it('Загрузка тестового файла в подкаталог', async () => {
        // await requester
        //     .post('/subdir')
        //     //.field('fileToUpload', 'customValue')
        //     .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
        //     .then( result => {
        // expect(result).to.have.status(200);
        // expect(result.body[0].location).to.include('/line.png');
        // });
    });
});

describe('Download tests', () => {
    // - появилась надпись
    // - можно скачать
    // - на каталоге нет подписи

});
