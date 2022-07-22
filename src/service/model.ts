import * as t from 'io-ts';

// Redirect model
export const Redirect = t.type({
  code: t.string,
  url: t.string,
  createdAt: t.number,
}, 'Redirect');
export type Redirect = t.TypeOf<typeof Redirect>

export default Redirect;
