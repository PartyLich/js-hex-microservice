import { nanoid } from 'nanoid';
import { Either, fromPredicate, map, chain } from 'fp-ts/Either';
import { flow } from 'fp-ts/function';

import { Redirect, RedirectService, RedirectStore } from './';

export const ErrRedirectNotFound = new Error('Redirect Not Found');
export const ErrRedirectInvalid = new Error('Redirect Invalid');

// Retrieves an URL based on its short code.
const find = (store: RedirectStore) => store.find;

// Save a Redirect object.
const store =
  (store: RedirectStore): (redirect: Redirect) => Either<Error, Redirect> =>
    flow(
        // TODO: if I have a Redirect, it should already be validated, right?
        fromPredicate(
            (_redirect: Redirect) => true,
            () => ErrRedirectInvalid,
        ),
        map((redirect) => ({
          ...redirect,
          code: nanoid(),
          createdAt: Date.now(),
        })),
        chain(store.store),
    );

// Creates an instance of the RedirectService interface.
const RedirectService = (redirectStore: RedirectStore): RedirectService =>
  Object.assign({}, {
    find: find(redirectStore),
    store: store(redirectStore),
  });

export default RedirectService;
