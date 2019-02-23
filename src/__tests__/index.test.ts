import { Greeter } from '../index';

test('index', () => {
  expect(Greeter('me')).toBe('Hello me');
});
