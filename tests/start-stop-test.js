const srv = require('../dist/fs_server');

// describe('Positive server runing tests:', () => {
//     let server;
//
//     it('Запуск сервера успешный', async () => {
//         server = srv.startServer();
//         // проверить что запущен сервер
//     });
//
//     it('Остановка запушенного сервера без ошибок', async () => {
//         setTimeout(() => {
//             srv.stopServer(server);
//         }, 1000);
//     });
// });

describe('Negative server runing tests:', () => {
    let server;

    // it('Возникновение ошибки при неверном указании порта', async () => {
    //     process.env.PORT = 100500;
    //     srv.startServer();
    // });

    it('Запуск на том же порту не возможно', async () => {
        server = srv.startServer();
        try {
            srv.startServer();
        }
        catch (e) {
            //Error: done() called multiple times
            console.log(`>>>> ${e.message}`);
        }
        finally {
            srv.stopServer(server);
        }
    });
});
