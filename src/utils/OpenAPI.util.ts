import { slug } from './Slug.util';
import { trimPath } from '../utils/TrimPath.util';

import type { EndpointConfig } from '../types/EndpointConfig.type';

const convertToOpenAPIParameters = (route: string) => {
  const params = [];
  const regex = /:([\w_]+)/g;

  let match;

  while ((match = regex.exec(route)) !== null) {
    params.push({
      schema: { type: 'string' },
      name: match[1],
      in: 'path',
      required: true
    });
  }

  return params;
};

export const generateOpenAPI = (endpoints: { config(): EndpointConfig }[]) => {
  const paths: Partial<Record<string, Record<string, object>>> = {};

  for (const endpoint of endpoints) {
    const endpoint_config = endpoint.config();

    const path = trimPath(global.config.api_base_url + endpoint_config.path);
    const openapi_path = path.replace(/:([\w]+)/g, '{$1}');

    paths[openapi_path] ??= {};

    paths[openapi_path][endpoint_config.method.toLowerCase()] = {
      operationId: `${endpoint_config.method.toLowerCase()}--${slug(endpoint_config.path)}`,

      parameters: [
        ...convertToOpenAPIParameters(path),

        ...(endpoint_config.method === 'GET'
          ? Object.keys(endpoint_config.fields).map((field) => ({
              schema: global.Yuppi.convertToJSONSchema(endpoint_config.fields).properties[field],
              name: field,
              in: 'query',
              required: endpoint_config.fields[field].required
            }))
          : [])
      ],

      ...(endpoint_config.method !== 'GET'
        ? {
            requestBody: {
              content: {
                'application/json': {
                  schema: global.Yuppi.convertToJSONSchema(endpoint_config.fields)
                }
              }
            }
          }
        : {}),

      responses: {
        200: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                examples: [
                  {
                    success: true,
                    latency: 1.0001,
                    code: 200,
                    result: {}
                  }
                ]
              }
            }
          }
        },

        400: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                examples: [
                  {
                    success: false,
                    latency: 1.0001,
                    code: 400,
                    result: {
                      message: 'Bad request',
                      code: `${endpoint_config.method.toLowerCase()}--${slug(endpoint_config.path)}/${slug('Bad request')}`
                    }
                  }
                ]
              }
            }
          }
        },

        500: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                examples: [
                  {
                    success: false,
                    latency: 1.0001,
                    code: 500,
                    result: {
                      message: 'Internal server error',
                      code: `${endpoint_config.method.toLowerCase()}--${slug(endpoint_config.path)}/${slug('Internal server error')}`
                    }
                  }
                ]
              }
            }
          }
        }
      },

      ...{ security: [{ Authorization: [] }] },
      tags: [endpoint_config.category],
      deprecated: endpoint_config.deprecated
    };
  }

  return JSON.stringify(
    {
      openapi: '3.0.0',

      info: {
        title: 'API Docs',
        description: '',
        version: '1.0.0'
      },

      paths,

      components: {
        securitySchemes: {
          Authorization: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    },
    null,
    2
  );
};
