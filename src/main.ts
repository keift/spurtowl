import { Elysia, file } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Yuppi } from 'yuppi';
import { Log } from '@keift/utils';

import { buildRouter, Router } from './endpoints/Router.endpoint';

import { config } from '../config';

const App = new Elysia();

const port = process.env.PORT;

if (port === undefined) throw new Error('PORT not defined');

global.config = config;

global.Yuppi = new Yuppi({ folder_path: './src' });
global.Log = new Log();
global.NumberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

await buildRouter();

App.use(cors());

App.use(Router);

App.get('/docs', (ctx) => ctx.redirect('/docs/v2'));

App.get('/', () => file('./src/static/index.html'));

App.get('/script.js', () => file('./src/static/script.js'));

App.get('/docs/v1', () => file('./src/static/swagger-ui.html'));

App.get('/docs/v2', () => file('./src/static/scalar.html'));

App.get('/assets/:filename', (ctx) => file(`./assets/${ctx.params.filename}`));

App.get('/robots.txt', () => file('./src/static/robots.txt'));

App.get('/favicon.ico', () => file('./src/static/favicon.ico'));

// eslint-disable-next-line @typescript-eslint/require-await
void (async () => {
  App.listen(port, () => {
    global.Log.info(`Elysia serving on port ${port}.`);
  });
})();
