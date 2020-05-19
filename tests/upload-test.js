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

    it.only('Загрузка тестового файла line.png в root', async () => {
        await requester
            .post('/')
            .field({ savePath: '/' })
            .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
            .then(result => {
                expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/`);
            });
        requester.close();

        // 1. Attach hidden field
        // 2. проверяем директорий на предмет наличия файла там

    });

    it.only('Проверка что текстовый файл line.png отображается при запросе get', async () => {
        // проверка появления файла в списке
        await requester.get('/')
            .then(res => {
                const $ = cheerio.load(res.text);

                $('li').each( (index, elem) => {
                    console.log(index, $(elem).text());
                });
            });
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
        await requester
            .post('/subdir')
            .field({ savePath: '/subdir' })
            .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
            // .then(result => {
            //     expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/subdir`);
            // })
            .catch(err => {
                console.log(err.message);
            });

        // 1. нет файла в директории subdir
        // 2. необходимо распарсить список файлов

        await requester.get('/subdir')
            .then(res => {
                // res.should.have.status(200);
                // res.body.should.be.a('array');
                // res.body.length.should.be.eql(0);
                console.log(res.text);
            });
    });
});

describe('Download tests', () => {
    // - появилась надпись
    // - можно скачать
    // - на каталоге нет подписи
    it('Проверка что у файла есть  (open)(download)', async () => {
        // проверка появления файла в списке
        await requester.get('/')
            .then(res => {
                const $ = cheerio.load(res.text);

                $('li').each( (index, elem) => {
                    console.log(index, $(elem).text());
                });
            });
    });
});
