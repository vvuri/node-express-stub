import express from 'express';
import chalk from 'chalk';

import { resDirListFiles } from './fs_tools';
import { HOST, PORT, ROOT_DIR } from './fs_config';

const app = express();

const dirPath = [
    '/',
    '/elements',
    '/elements/subelements'
];

for (const path of dirPath) {
    app.use(path, express.static(ROOT_DIR + path));
    app.get(path, resDirListFiles);
}

app.listen(PORT, () => {
    console.log(chalk.blue(`Server running at http://${HOST}:${PORT}/`));
});

export default app;
