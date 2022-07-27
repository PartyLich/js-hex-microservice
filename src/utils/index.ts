// Set the name property on an Error.
// unfortunately this cannot be done as part of the instance creation.
export const setErrName = (name: string) => (err: Error) => {
  err.name = name;
  return err;
};
