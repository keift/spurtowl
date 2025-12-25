import type { Yuppi } from 'yuppi';
import type { Increment } from 'uuniq';

import type { Debugger } from '../src/utils/Debugger.util';

import type { config as Config } from '../config';

declare global {
  var build: {
    id: string;
    date: string;
  };

  var Yuppi: Yuppi;
  var Increment: Increment;
  var IncrementForUsers: Increment;
  var Debugger: Debugger;

  var NumberFormat: Intl.NumberFormat;

  var config: typeof Config;
}
