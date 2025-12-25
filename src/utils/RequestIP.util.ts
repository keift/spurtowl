import _RequestIP from 'request-ip';

import type { Context } from 'elysia';

export const requestIP = (ctx: Context) => {
  const ip_address_from_headers = _RequestIP.getClientIp({ headers: ctx.headers });

  if (ip_address_from_headers !== null) return ip_address_from_headers;

  if (ctx.server) {
    const request_ip = ctx.server.requestIP(ctx.request);

    if (request_ip?.address !== undefined) {
      const parts = request_ip.address.split(':');

      return parts[3] ?? request_ip.address;
    }
  }

  return '127.0.0.1';
};
