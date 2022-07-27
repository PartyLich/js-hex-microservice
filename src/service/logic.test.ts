import _test, { TestFn } from 'ava';
import { right, left, fold } from 'fp-ts/Either';

import Service from './logic';
import { Redirect, RedirectService, ErrRedirectNotFound } from './';

const test = _test as TestFn<{service: RedirectService}>;

const DUMMY_REDIRECT: Redirect = {
  url: 'foobar',
  code: 'foobar',
  createdAt: 0,
} as const;
const dummyRedirect = (): Redirect => Object.assign(
    {},
    DUMMY_REDIRECT,
);

test.beforeEach((t) => {
  const m: Record<string, Redirect> = {};
  const mockRepo: RedirectService = {
    find: (code) => {
      return m[code]
        ? right(m[code])
        : left(Error('not found', { cause: ErrRedirectNotFound }));
    },
    store: (redirect) => {
      m[redirect.code] = redirect;
      return right(redirect);
    },
  };

  mockRepo.store({
    code: 'foobar',
    url: 'https://google.com',
    createdAt: 42,
  });

  t.context.service = Service(mockRepo);
});

test('service.store', (t) => {
  const actual = t.context.service.store(dummyRedirect());

  fold<Error, Redirect, void>(
      () => t.fail('store result should be a Right'),
      (redirect: Redirect) => {
        t.is(typeof redirect.url, 'string', 'url should be a number');
        t.is(typeof redirect.code, 'string', 'code should be a string');
        t.is(typeof redirect.createdAt, 'number', 'createdAt should be a string');
        t.is(redirect.url, DUMMY_REDIRECT.url, 'url should match argument');
        t.not(redirect.code, DUMMY_REDIRECT.code, 'service should set a short code');
        t.not(redirect.createdAt, DUMMY_REDIRECT.createdAt, 'service should set the createdAt field');
      },
  )(actual);
});

test('service.find', (t) => {
  const actual = t.context.service.find('foobar');

  fold<Error, Redirect, void>(
      () => t.fail('find result should be a Right'),
      (redirect: Redirect) => {
        t.is(typeof redirect.url, 'string', 'url should be a number');
        t.is(typeof redirect.code, 'string', 'code should be a string');
        t.is(typeof redirect.createdAt, 'number', 'createdAt should be a string');
        t.is(redirect.url, 'https://google.com', 'should return stored url');
        t.is(redirect.code, 'foobar', 'should return stored short code');
        t.is(redirect.createdAt, 42, 'should return stored createdAt');
      },
  )(actual);
});

test('service.find: missing code', (t) => {
  const actual = t.context.service.find('DNE');

  fold<Error, Redirect, void>(
      (err) => {
        t.true('message' in err, 'error should have a message prop');
        t.true('cause' in err, 'error should have a cause');
        t.is(err.cause, ErrRedirectNotFound, 'error cause should be NotFound');
      },
      () => t.fail('find result should be a Left'),
  )(actual);
});
