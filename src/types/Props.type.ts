import type { Context } from 'elysia';
import type { AnyObject } from 'yuppi';

export type Props = {
  ip_address: string;

  perf_now: number;
  context: Context & { fields: AnyObject };
};
