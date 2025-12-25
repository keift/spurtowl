import Slugify from 'slugify';

export const slug = (text: string, replacement = '-', remove?: RegExp, lower = true, locale = 'en') => {
  return Slugify(text.replaceAll('/', replacement).replaceAll('_', replacement).replaceAll(':', replacement).replaceAll('.', replacement), {
    replacement,
    remove,
    lower,
    locale,
    strict: true,
    trim: true
  });
};
