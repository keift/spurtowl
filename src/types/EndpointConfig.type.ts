import type { Schema } from 'yuppi';

export type EndpointConfig = {
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  category: 'Chess';
  limit: number;
  cooldown: number;
  fields: Schema;
  deprecated: boolean;
  disabled: boolean;
};
