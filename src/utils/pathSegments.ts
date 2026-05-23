export type PathSegment =
  | { role: 'collection'; text: string }
  | { role: 'id'; text: string }
  | { role: 'slash'; text: '/' };

const namedSegment = (text: string, index: number): PathSegment => ({
  role: index % 2 === 0 ? 'collection' : 'id',
  text,
});

export const splitPathSegments = (path: string): PathSegment[] => {
  if (!path) return [];
  return path
    .split('/')
    .flatMap<PathSegment>((text, index) =>
      index === 0
        ? [namedSegment(text, index)]
        : [{ role: 'slash', text: '/' }, namedSegment(text, index)]
    );
};
