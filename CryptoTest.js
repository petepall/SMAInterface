import crypto from 'crypto';

const KEY = '0d13d893-7de9-4082-a5c6-3b75d96f325f';
const METHOD = 'get';
const SERVICE = 'data';
const date = '2022-10-10T14:22:15'; // (new Date()).toISOString().slice(0, 19);
const IDENTIFIER = 'db9f5633-c5da-452a-8f42-c3124d48e530';

const encoded = crypto.createHmac('sha1', KEY)
	.update(METHOD.toLowerCase())
	.update(SERVICE.toLowerCase())
	.update(date)
	.update(IDENTIFIER)
	.digest('base64');
console.log(encoded);

// should return key: b'KWvvg9citNpKGUX2ZfT0fgAj/fQ='
// const sig = crypto.createHmac('sha1', KEY).digest('base64');
// console.log(sig);

// import crypto from 'crypto';

// const body = 'Hello World';
// const secret = 'MySecret';

// const hmac = crypto.createHmac('sha1', secret)
// 	.update(body)
// 	.digest('base64');
// console.log(hmac);
