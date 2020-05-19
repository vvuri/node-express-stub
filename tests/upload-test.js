import chai from 'chai';
import cheerio from 'cheerio';
import { clearDir, createRequester, testConfig } from './helper';
import StaticServer from '../src/fs_server';

const expect = chai.expect;

describe('Upload tests', () => {
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
        await clearDir(testConfig.rootDir, true);
        srv = new StaticServer(testConfig);
        srv.currentDir = '/';
        await srv.start();
    });

    after(async () => {
        requester.close();
        await srv.stop();
        // await clearDir(testConfig.rootDir, true);
    });

    it('Загрузка тестового файла line.png в root', async () => {
        await requester
            .post('/')
            .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
            .then(result => {
                expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/`);
            });
        requester.close();

        // проверяем директорий на предмет наличия файла там

    });

    it('Проверка что текстовый файл line.png отображается при запросе get', async () => {
        // проверка появления файла в списке
        const text = await requester.get('/').content;

        console.log(text);
        const $ = cheerio.load(text);

        console.log($('li'));
        requester.close();
    });

    it('Загрузка файла c тем же именем в root', async () => {

    });

    it.only('Загрузка тестового файла в подкаталог', async () => {
        // await requester
        //     .post('/subdir')
        //     //.field('fileToUpload', 'customValue')
        //     .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
        //     .then( result => {
        // expect(result).to.have.status(200);
        // expect(result.body[0].location).to.include('/line.png');
        // });
        const text = await requester.get('/').content;

        console.log(text);

        await requester
            .post('/subdir')
            .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
            .then(result => {
                expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/subdir`);
            })
            .catch(err => {
                console.log(err.message);
            });
        requester.close();
    });
});

describe('Download tests', () => {
    // - появилась надпись
    // - можно скачать
    // - на каталоге нет подписи

});
