import { Analyze } from '../../utils/Analyze-v2.util';
import { RESTSchema } from '../../utils/RESTSchema.util';

import type { EndpointOptions } from '../../types/EndpointOptions.type';
import type { EndpointConfig } from '../../types/EndpointConfig.type';

import type { GetAnalyze as Fields } from '../../yuppi/types/GetAnalyze';

export const GetAnalyze = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async handle({ props }: EndpointOptions) {
    const fields = props.context.fields as Fields;

    let analyze;

    try {
      analyze = Analyze(fields.fen, { thinking_time: 2500 });
    } catch {
      return RESTSchema({ message: 'Invalid FEN' }, 400, props);
    }

    return RESTSchema(analyze, 200, props);
  },

  config(): EndpointConfig {
    return {
      path: '/analyze',
      method: 'GET',
      category: 'Chess',

      limit: 1000,
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
