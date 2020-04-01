import express from 'express';

import { rootDir, filesDir } from './fs_tools';
import config from '../config.json';

const { hostname, port } = config;

const app = express();

app.get('/', rootDir);
app.get('/:id', filesDir);
app.get('/elements/:id', filesDir);
app.get('/elements/subelements/:id', filesDir);

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

export default app;
