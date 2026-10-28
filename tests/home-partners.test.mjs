import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../assets/index-D7AjnQ7W.js', import.meta.url),'utf8');
assert.equal((source.match(/partnersTitle:/g)||[]).length,6);
assert.match(source,/هلدینگ صنعتی هامون با ذوب‌آهن، فولاد مبارکه و شهرداری‌ها همکاری می‌کند/);
assert.match(source,/\(0,M\.jsx\)\(hamunPartners,\{\}\)/);
assert.match(source,/id:`partners-title`/);
console.log('home partners tests passed');
