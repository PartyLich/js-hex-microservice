import * as t from 'io-ts';

// Server configuration
export const Config = t.type({
  port: t.number,
  hostname: t.string,
});
export type Config = t.TypeOf<typeof Config>
