import * as moduleInstance from './index';

it('getTopTVShows() returns top 3 shows', () => {
  const res = moduleInstance.getTopTVShows(3);
  expect(res).toEqual(['The Wire', 'Breaking Bad', 'Seinfeld']);
});
