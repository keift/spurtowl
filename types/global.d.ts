import type { Yuppi } from 'yuppi';
import type { Log } from '@keift/utils';

import type { config as Config } from '../config';

declare global {
  var config: typeof Config;

  var Yuppi: Yuppi;
  var Log: Log;
  var NumberFormat: Intl.NumberFormat;
}
