import type { Yuppi } from 'yuppi';

import type { Debugger } from '../src/utils/Debugger.util';

import type { config as Config } from '../config';

declare global {
  var Yuppi: Yuppi;
  var Debugger: Debugger;

  var NumberFormat: Intl.NumberFormat;

  var config: typeof Config;
}
