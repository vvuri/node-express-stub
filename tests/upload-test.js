import chai from 'chai';
import { createRequester, testConfig } from './helper';
import StaticServer from '../src/fs_server';

const assert = chai.assert;

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
        testConfig.dirPath = ['/', '/subdir1', '/subdir2'];
        srv = new StaticServer(testConfig);
        await srv.start();
    });

    after(async () => {
        requester.close();
        //await srv.stop();
    });

    it('Загрузка тестового файла в root', async () => {
        const res = await requester.get('/');

        assert.equal(res.header['content-length'] > 550, true);
        requester.close();
    });

    it('Загрузка файла c тем же миением в root', async () => {

    });

    it('Загрузка тестового файла в подкаталог', async () => {

    });

});

describe('Download tests', () => {
    // - появилась надпись
    // - можно скачать
    // - на каталоге нет подписи

});
