import { Chess } from 'chess.js';
import { Patterns } from 'yuppi';

import { RESTSchema } from '../../utils/RESTSchema.util';

import type { EndpointOptions } from '../../types/EndpointOptions.type';
import type { EndpointConfig } from '../../types/EndpointConfig.type';

import type { GetAnalyze as Fields } from '../../yuppi/types/GetAnalyze';

export const GetAnalyze = {
  async handle({ props }: EndpointOptions) {
    const fields = props.context.fields as Fields;

    const chess = new Chess(fields.fen);

    return RESTSchema({}, 201, props);
  },

  config(): EndpointConfig {
    return {
      path: '/analyze',
      method: 'GET',
      category: 'Chess',

      limit: 10,
      cooldown: 10000,

      fields: {
        fen: {
          type: 'string',
          nullable: false,
          required: true
        }
      },

      deprecated: false,
      disabled: false
    };
  }
};
