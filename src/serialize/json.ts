import { pipe, flow, unsafeCoerce } from 'fp-ts/function';
import { Either, tryCatch, map, chain, mapLeft } from 'fp-ts/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';

import { Redirect, RedirectSerializer, ErrRedirectInvalid } from 'service';
import { setErrName } from 'utils';

// Encode converts a Redirect to json
export const encode = (input: Redirect): Either<Error, Buffer> =>
  pipe(
      tryCatch(
          () => JSON.stringify(input),
          (reason) => Error(
              'serializer.Redirect.encode',
              { cause: reason as Error },
          ),
      ),
      // default encoding is utf8
      map(Buffer.from),
      mapLeft(setErrName('SerializationError')),
  );

const parseJson = (input: Buffer): Either<Error, unknown> =>
  tryCatch(
      () => pipe(
          input.toString('utf8'),
          JSON.parse,
      ),
      unsafeCoerce<unknown, Error>,
  );

// Converts a json Buffer to a Redirect
export const decode = (input: Buffer): Either<Error, Redirect> =>
  pipe(
      parseJson(input),
      mapLeft((err) => Error(
          `serialize.json.decode::${ err.toString() }`,
          { cause: ErrRedirectInvalid },
      )),
      chain(flow(
          Redirect.decode,
          // convert Errors list to formatted string
          (validation) =>
            mapLeft(() => pipe(
                validation,
                PathReporter.report,
                (arr) => arr.join('\n'),
            ))(validation),
          mapLeft((msg) => Error(msg, { cause: ErrRedirectInvalid })),
      )),
      mapLeft(setErrName('SerializationError')),
  );

const serializer: RedirectSerializer = {
  encode,
  decode,
};

export default serializer;
