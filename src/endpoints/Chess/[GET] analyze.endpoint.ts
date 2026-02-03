import { Piscina } from 'piscina';
import path from 'path';

import type { Analyze } from '../../utils/Analyze-v2.util';
import { RESTSchema } from '../../utils/RESTSchema.util';

import type { EndpointOptions } from '../../types/EndpointOptions.type';
import type { EndpointConfig } from '../../types/EndpointConfig.type';

import type { GetApiAnalyze as Fields } from '../../generated/yuppi/types/GetApiAnalyze';

const analyze = new Piscina({ filename: path.join('./', 'src', 'utils', 'Analyze-v2.util.ts') });

export const GetAnalyze = {
  async handle({ props }: EndpointOptions) {
    const fields = props.context.fields as Fields;

    fields.fen;

    let analyze_result: ReturnType<typeof Analyze>;

    try {
      analyze_result = (await analyze.run({ fen: fields.fen, options: { thinking_time: 2500 } })) as ReturnType<typeof Analyze>;
    } catch {
      return RESTSchema({ message: 'Invalid FEN' }, 400, props);
    }

    return RESTSchema(analyze_result ?? { from: null, to: null }, 200, props);
  },

  config(): EndpointConfig {
    return {
      path: '/analyze',
      method: 'GET',
      category: 'Chess',

      limit: 10,
      cooldown: 10000,

      fields: {
        fen: [
          {
            type: 'string',
            nullable: false,
            required: true
          },
          {
            type: 'number',
            nullable: false,
            required: true
          },
          {
            type: 'boolean',
            nullable: false,
            required: true
          },
          {
            type: 'date',
            nullable: false,
            required: true
          }
        ]
      },

      deprecated: false,
      disabled: false
    };
  }
};
