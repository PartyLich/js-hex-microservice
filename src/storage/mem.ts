import { flow } from 'fp-ts/function';
import { fromNullable, right } from 'fp-ts/Either';

import { Redirect, RedirectStore, ErrRedirectNotFound } from 'service';


const storage = new Map<string, Redirect>();

// Lookup a URL based on its short code.
const find: RedirectStore['find'] = flow(
    (code) => storage.get(code),
    fromNullable(Error('storage.mem.find', { cause: ErrRedirectNotFound })),
);

// Save a Redirect object.
const store: RedirectStore['store'] =
  flow(
      // TODO: handle collisions
      (redirect: Redirect) => {
        storage.set(redirect.code, redirect);
        return redirect;
      },
      right,
  );

// Provides methods for saving and retrieving Redirects.
export const memStore: RedirectStore = {
  find,
  store,
};

// Create an instance of the RedirectStore interface.
export const MemoryStore = () => memStore;

export default MemoryStore;
