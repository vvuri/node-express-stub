import chai from 'chai';
import cheerio from 'cheerio';
import { clearDir, createRequester, testConfig } from './helper';
import StaticServer from '../dist/fs_server';
import { getDir } from '../dist/fs_helper';

const expect = chai.expect;

describe('Upload tests', () => {
    // upload
    // - в / загрузить
    // -- проверка на редирек
    // -- появился в каталоге
    // -- появился при запросе http
    // - с тем же именем - новое имя
    // - в подкаталог - появился
    // имя файла
    // - один символ
    // - русские буквы
    // - длинное название
    // - с пробелами
    // форматы
    // - набор файлов из public загрузить
    // - проверить что все загрузились успешно
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

    describe.only('Цепочка связанных тестов', () => {
        it('Загрузка тестового файла line.png в root', async () => {
            await requester
                .post('/')
                .field({ savePath: '/' })
                .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
                .then(result => {
                    expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/`);
                });
        });

        it('Загруженный файл line.png записался на диск ', async () => {
            const listFiles = await getDir(`${testConfig.rootDir}/`, 'utf-8');

            expect(listFiles.some(file => {
                return file === 'line.png';
            })).to.eql(true);
        });

        it('Загруженный файл line.png отдается в запросе get', async () => {
            let isAvailabile = false;

            await requester.get('/')
                .then(res => {
                    const $ = cheerio.load(res.text);

                    $('li').each((index, elem) => {
                        if ($(elem).text().includes('line.png (open)(download)'))
                            isAvailabile = true;
                    });
                });
            expect(isAvailabile).to.eql(true);
        });

        it('Загрузка файла c тем же именем в root', async () => {

        });
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
        // await requester.get('/')
        //     .then(res => {
        //         const $ = cheerio.load(res.text);
        //
        //         $('li').each( (index, elem) => {
        //             console.log(index, $(elem).text());
        //         });
        //     });
    });
});
