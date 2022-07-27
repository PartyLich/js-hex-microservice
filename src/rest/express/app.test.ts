import _test, { TestFn } from 'ava';
import req from 'supertest';

import MemoryStore from 'storage/mem';
import RedirectService from 'service';
import app from './app';

const test = _test as TestFn<{server: ReturnType<typeof app>}>;

test.before(async (t) => {
  const repo = MemoryStore();
  const service = RedirectService(repo);
  repo.store({
    code: 'foobar',
    url: 'https://google.com',
    createdAt: 0,
  });

  t.context.server = app({ service });
});

// Redirect to long URL
test('GET /:code 301 response', async (t) => {
  const path = '/foobar';
  const res = await req(t.context.server)
      .get(path);

  t.is(res.status, 301, 'response status should be 301');
  t.is(res.type, 'text/plain', 'content type should be text');
});

// Short code not found
test('GET /:code 404 response', async (t) => {
  const path = '/bad-code';
  const res = await req(t.context.server)
      .get(path);

  t.is(res.status, 404, 'response status should be 404');
  t.is(res.type, 'text/plain', 'content type should be text');
  t.regex(res.text, /not found/i, 'response should contain "not found"');
});

// Redirect created
test('POST / 201 response', async (t) => {
  const path = '/';
  const data = {
    code: '',
    url: 'https://www.google.com',
    createdAt: 0,
  };
  const res = await req(t.context.server)
      .post(path)
      .set('content-type', 'application/json')
      .send(data);

  t.is(res.status, 201, 'response status should be 201');
  t.is(res.type, 'application/json', 'content type should be json');
  t.is(res.body.url, data.url, 'response object url should equal payload');
  t.is(typeof res.body.code, 'string', 'response object code should be string');
  t.is(typeof res.body.createdAt, 'number', 'response object createdAt should be number');
});

// Malformed request
test('POST / 400 response: no body', async (t) => {
  const path = '/';
  const res = await req(t.context.server)
      .post(path)
      .set('content-type', 'application/json');

  t.is(res.status, 400, 'response status should be 400');
  t.is(res.type, 'text/plain', 'content type should be text');
});

// Malformed request
test('POST / 400 response: bad data', async (t) => {
  const path = '/';
  const data = [
    {
      code: '',
      // wrong type
      url: 0,
      createdAt: 0,
    },
    {
      // wrong type
      code: 0,
      url: 'https://www.google.com',
      createdAt: 0,
    }, {
      code: '',
      url: 'https://www.google.com',
      // missing value => bad request
      // createdAt: 0,
    },
  ];

  for (const payload of data) {
    const res = await req(t.context.server)
        .post(path)
        .set('content-type', 'application/json')
        .send(payload);

    t.is(res.status, 400, 'response status should be 400');
    t.is(res.type, 'text/plain', 'content type should be text');
  }
});
