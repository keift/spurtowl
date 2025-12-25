import { requestIP } from './RequestIP.util';
import { slug } from './Slug.util';

import type { Props } from '../types/Props.type';

export const RESTSchema = (result: Record<string, unknown>, code: number, props: Props) => {
  let success = true;

  props.context.set.status = code;
  props.context.set.headers['content-type'] = 'application/json; charset=utf-8';

  const endpoint_identifier = `${props.context.request.method.toLowerCase()}--${slug(props.context.route)}`;

  if (code.toString().startsWith('4') || code.toString().startsWith('5')) success = false;
  if (result.message !== undefined) result = { ...result, code: `${endpoint_identifier}/${slug(typeof result.message === 'string' ? result.message : '')}` };

  const ip_address = requestIP(props.context);
  const latency = Number((performance.now() - props.perf_now).toFixed(4));

  global.Debugger.info(`\x1b[90m[\x1b[37m${ip_address} \x1b[90m⇋ ${latency.toFixed(2)} ms ${success ? '\x1b[32m' : '\x1b[31m'}${code.toString()}\x1b[90m] \x1b[34m${props.context.request.method.toUpperCase()} \x1b[33m${props.context.path}`);

  return JSON.stringify({ success, latency, code, result }, null, 2);
};
