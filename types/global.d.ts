import type { Yuppi } from 'yuppi';
import type { Logger } from '@keift/utils';

import type { config as Config } from '../config';

declare global {
  var config: typeof Config;

  var Yuppi: Yuppi;
  var Logger: Logger;
  var NumberFormat: Intl.NumberFormat;
}
