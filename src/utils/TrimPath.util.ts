export const trimPath = (path: string) => {
  path = `//${path}`;

  return path.replace(/\/+/g, '/');
};
