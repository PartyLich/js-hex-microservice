import { pipe } from 'fp-ts/function';
import { fold, chain, fromNullable, fromPredicate } from 'fp-ts/Either';
import express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import PinoHttp, { Options } from 'pino-http';

import {
  RedirectService,
  RedirectSerializer,
  ErrRedirectInvalid,
  ErrRedirectNotFound,
  Logger,
} from 'service';
import jsonSerializer from 'serialize/json';
import defaultLogger from 'logger';

const getSerializer = (contentType: string): RedirectSerializer => {
  return jsonSerializer;
};

// redirect to stored url
// GET /:code
const getRedirect =
  (redirectService: RedirectService): RequestHandler<{code: string}> =>
    async (req, res, _next) => {
      pipe(
          req.params.code,
          fromNullable(Error(
              'missing url code',
              { cause: ErrRedirectNotFound },
          )),
          chain(redirectService.find),
          fold(
              (err) => {
                req.log.error(err);
                if (err.cause === ErrRedirectNotFound) {
                  res.sendStatus(StatusCodes.NOT_FOUND);
                  return;
                }

                res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
              },
              (redirect) => {
                res.redirect(StatusCodes.MOVED_PERMANENTLY, redirect.url);
              },
          ),
      );
    };

// create code for url redirect
// POST /
const createRedirect = (redirectService: RedirectService): RequestHandler =>
  async (req, res, _next) => {
    const contentType = (req.header('content-type') || '');

    pipe(
        req.body,
        fromNullable(Error(
            'Missing request body',
            { cause: ErrRedirectInvalid },
        )),
        chain(fromPredicate(
            Buffer.isBuffer,
            () => Error('Invalid request body', { cause: ErrRedirectInvalid }),
        )),
        chain(getSerializer(contentType).decode),
        // store returns a new obj with code and createdAt filled in
        chain(redirectService.store),
        chain(getSerializer(contentType).encode),
        fold(
            (err) => {
              req.log.error(err);
              if (err.cause === ErrRedirectInvalid) {
                return res.sendStatus(StatusCodes.BAD_REQUEST);
              }

              return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
            },
            (redirect) => {
              return res.status(StatusCodes.CREATED)
                  .set('content-type', contentType)
                  .send(redirect);
            },
        ),
    );
  };

 type Config = {
   service: RedirectService;
   logger?: Logger;
 }

const makeHandler = ({ service, logger = defaultLogger }: Config) => {
  const app = express();

  app.disable('x-powered-by');
  // parse request payload into a Buffer
  app.use(express.raw({
    type: [
      'application/json',
      'application/octet-stream',
    ],
  }));
  app.use(express.urlencoded({ extended: false }));
  app.use(PinoHttp({
    logger: logger as Options['logger'],
  }));

  app.route('/:code')
      .get(getRedirect(service));
  app.route('/')
      .post(createRedirect(service));

  return app;
};

export default makeHandler;
