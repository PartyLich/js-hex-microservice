import { Either } from 'fp-ts/Either';

import { Redirect } from 'service';

// Provides methods to serialize and deserialize Redirect objects
export interface RedirectSerializer {
  encode: (input: Redirect) => Either<Error, Buffer>;
  decode: (input: Buffer) => Either<Error, Redirect>;
}
