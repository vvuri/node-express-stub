# nodejs-stub
Simple static server on Node.js
- View a list of files and directories
- Ability to open or download a file
- Ability to upload a file to the current directory

### Build
```bash
$ npm run build
```

### Run fs_server
```bash
$ npm start
```

### Run test
```bash
$ npm test
```
or  ESLint, Test and run Server
```bash
$ npm run all
```

### configure
- config.json - file configuration
- host:port - IP server listen
- dirname - public directory

#### Environment variables by default:
```
HOST=127.0.0.1
PORT=8888
ROOT_DIR=public
```
or rename .vue_simple to .vue

#### Example run Server in code
```javascript
const args = {
    host:    '127.0.0.1',
    port:    '8888',
    rootDir: 'public',
};
const srv = new StaticServer(args);

await srv.start();
```
