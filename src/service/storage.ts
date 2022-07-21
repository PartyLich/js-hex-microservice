import { Either } from 'fp-ts/Either';

import { Redirect } from 'service';

// Provides methods for saving and retrieving Redirects.
export interface RedirectStore {
  // Lookup a URL based on its short code.
  find: (code: string) => Either<Error, Redirect>;
  // Save a Redirect object.
  store: (redirect: Redirect) => Either<Error, Redirect>;
}

export default RedirectStore;
