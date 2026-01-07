import { Elysia, type Context } from 'elysia';
import type { ValidationError } from 'yuppi';

import { RESTSchema } from '../utils/RESTSchema.util';
import { requestIP } from '../utils/RequestIP.util';
import { trimPath } from '../utils/TrimPath.util';
import { generateOpenAPI } from '../utils/OpenAPI.util';
import { slug } from '../utils/Slug.util';

import type { Props } from '../types/Props.type';

import { GetAnalyze } from './Chess/[GET] analyze.endpoint';

const endpoints = [GetAnalyze];

const cooldowns = new Map<string, number>();

const createProps = (context: Context): Props => ({
  ip_address: requestIP(context),

  perf_now: performance.now(),
  context: { ...context, fields: {} }
});

export const Router = new Elysia();

export const buildRouter = async () => {
  for (const endpoint of endpoints) {
    const endpoint_config = endpoint.config();

    const path = trimPath(global.config.api_base_url + endpoint_config.path);
    const endpoint_identifier = `${endpoint_config.method.toLowerCase()}--${slug(path)}`;

    await global.Yuppi.declare(endpoint_config.fields, endpoint_identifier);

    Router.route(endpoint_config.method.toLowerCase(), path, async (ctx) => {
      const props = createProps(ctx);

      try {
        const request_identifier = `${endpoint_identifier}:${props.ip_address}`;

        if (endpoint_config.disabled) return RESTSchema({ message: 'Method not allowed' }, 405, props);

        if (endpoint_config.limit !== 0) {
          if ((cooldowns.get(request_identifier) ?? 0) >= endpoint_config.limit) return RESTSchema({ message: 'Too many requests' }, 429, props);

          cooldowns.set(request_identifier, (cooldowns.get(request_identifier) ?? 0) + 1);

          setTimeout(() => {
            cooldowns.set(request_identifier, (cooldowns.get(request_identifier) ?? 0) - 1);

            if (cooldowns.get(request_identifier) === 0) cooldowns.delete(request_identifier);
          }, endpoint_config.cooldown);
        }

        props.context.fields = { ...props.context.query, ...(props.context.body as Record<string, unknown>) };

        try {
          props.context.fields = await global.Yuppi.validate(endpoint_config.fields, props.context.fields);

          return await endpoint.handle({ props });
        } catch (error) {
          const errors = (error as ValidationError).errors;

          return RESTSchema({ message: errors[0] }, 400, props);
        }
      } catch (error) {
        global.Log.error(error as string);

        return RESTSchema({ message: 'Internal server error' }, 500, props);
      }
    });
  }

  Router.get(global.config.api_base_url, (ctx) => {
    const props = createProps(ctx);

    return RESTSchema({ endpoints: endpoints.map((endpoint) => endpoint.config()) }, 200, props);
  });

  Router.get('/docs/openapi.json', () => generateOpenAPI(endpoints));

  for (const endpoint of endpoints) {
    const endpoint_config = endpoint.config();
    const path = trimPath(global.config.api_base_url + endpoint_config.path);

    Router.all(path, (ctx) => {
      const props = createProps(ctx);

      return RESTSchema({ message: 'Method not allowed' }, 405, props);
    });
  }

  Router.all('*', (ctx) => {
    const props = createProps(ctx);

    return RESTSchema({ message: 'Not found' }, 404, props);
  });
};
