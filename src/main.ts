import { getDefaultByUrl } from '../lib/index';

const url = new URLSearchParams({
    a: '1123',
}).toString();

const o = getDefaultByUrl(
    [
        {
            key: 'a',
            type: 'n',
        },
    ],
    url
);

console.log('o', o);
