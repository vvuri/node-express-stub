import chai from 'chai';
import cheerio from 'cheerio';
import { clearDir, createRequester, getMD5sum, testConfig } from './helper';
import StaticServer from '../dist/fs_server';
import { getDir } from '../dist/fs_helper';

const expect = chai.expect;

describe('Upload file tests:', () => {
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
        await clearDir(testConfig.rootDir, true);
    });

    let runs = [
        { it: 'root', path: '/' },
        { it: 'subdir', path: '/subdir/' }
    ];

    runs.forEach( run => {
        describe(`A chain of related tests. Upload file to ${ run.it }`, () => {
            it('Upload test file line.png and redirect', async () => {
                // srv.currentDir = run.path;
                await requester
                    .post('/')
                    .field({ savePath: run.path })
                    .attach('fileToUpload', './tests/public/elements/line.png', 'line.png')
                    .then(result => {
                        expect(result).to.redirectTo(`http://${testConfig.host}:${testConfig.port}/`);
                    });
            });

            it('The uploaded file line.png was written to disk', async () => {
                const listFiles = await getDir(`${testConfig.rootDir}${run.path}`, 'utf-8');

                expect(listFiles.some(file => {
                    return file === 'line.png';
                })).to.eql(true);
            });

            it('The uploaded file line.png was given in get request', async () => {
                let isAvailabile = false;

                await requester.get(run.path)
                    .then(res => {
                        const $ = cheerio.load(res.text);

                        $('li').each((index, elem) => {
                            if ($(elem).text().includes('line.png (open)(download)'))
                                isAvailabile = true;
                        });
                    });
                expect(isAvailabile).to.eql(true);
            });

            it('Rename a file with the same name', async () => {
                await requester
                    .post('/')
                    .field({ savePath: run.path })
                    .attach('fileToUpload', './tests/public/elements/line.png', 'line.png');

                const listFiles = await getDir(`${testConfig.rootDir}${run.path}`, 'utf-8');

                expect(listFiles.some(file => {
                    return file.includes('_line.png');
                })).to.eql(true);
            });
        });
    });

    runs = [
        { it: 'One symbol', fileName: '1', path: '/subdir/subsubdir/' },
        { it: 'long', fileName: 'VeryLongNameOfFileDownloadOnServer.txt', path: '/' },
        { it: 'Cyrillic', fileName: 'Название файла на русском языке.doc', path: '/subdir/subsubdir/' },
        { it: 'Space', fileName: 'Test file 2 download.txt', path: '/subdir/subsubdir/' },
        { it: 'Dots', fileName: 'File.with.dots', path: '/subdir/' }
    ];

    runs.forEach( run => {
        it(`Uploaded file names with ${run.it} name`, async () => {
            await requester
                .post('/')
                .field({ savePath: run.path })
                .attach('fileToUpload', './tests/public/elements/text.txt', run.fileName)
                .then(result => {
                    expect(result).to.have.status(200);
                });
            const listFiles = await getDir(`${testConfig.rootDir}${run.path}`, 'utf-8');

            expect(listFiles.some(file => {
                return file === run.fileName;
            })).to.eql(true);
        });
    });

    runs = [
        { it: 'TXT', sourceDir: './tests/public/elements/', fileName: 'text.txt', path: '/' },
        { it: 'PDF', sourceDir: './tests/public/', fileName: 'sample.pdf', path: '/' },
        { it: 'HTML', sourceDir: './tests/public/', fileName: 'Table_htm.htm', path: '/subdir/' },
        { it: 'JPEG', sourceDir: './tests/public/elements/', fileName: 'zond.jpeg', path: '/subdir/' },
        { it: 'PNG', sourceDir: './tests/public/elements/', fileName: 'line.png', path: '/subdir/subsubdir/' },
        { it: 'SVG', sourceDir: './tests/public/elements/subelements/', fileName: 'logo2.svg', path: '/subdir/subsubdir/' },
        { it: 'MP4', sourceDir: './tests/public/elements/', fileName: 'file_example_MP4_640_3MG.mp4', path: '/subdir/subsubdir/' }
    ];

    runs.forEach( run => {
        it(`Uploaded format file - ${run.it}`, async () => {
            await requester
                .post('/')
                .field({ savePath: run.path })
                .attach('fileToUpload', `${run.sourceDir}${run.fileName}`, run.fileName)
                .then(result => {
                    expect(result).to.have.status(200);
                });

            expect(getMD5sum(`${run.sourceDir}${run.fileName}`))
                .to.eql(getMD5sum(`${testConfig.rootDir}${run.path}${run.fileName}`));
        });
    });
});