import { Elysia, file } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Yuppi } from 'yuppi';

import { Debugger } from './utils/Debugger.util';

import { buildRouter, Router } from './endpoints/Router.endpoint';

import { config } from '../config';

const App = new Elysia();

const port = process.env.PORT;

if (port === undefined) throw new Error('PORT not defined');

global.Yuppi = new Yuppi({ folder_path: './src' });
global.Debugger = new Debugger();

global.NumberFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

global.config = config;

buildRouter();

App.use(cors());

App.use(Router);

App.get('/docs', (ctx) => ctx.redirect('/docs/v2'));

App.get('/docs/v1', () => file('./src/static/swagger-ui.html'));

App.get('/docs/v2', () => file('./src/static/scalar.html'));

App.get('/robots.txt', () => file('./src/static/robots.txt'));

App.get('/favicon.ico', () => file('./src/static/favicon.ico'));

// eslint-disable-next-line @typescript-eslint/require-await
void (async () => {
  App.listen(port, () => {
    global.Debugger.info(`Elysia serving on port ${port}.`);
  });
})();
