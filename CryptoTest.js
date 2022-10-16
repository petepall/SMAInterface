import crypto from 'crypto';

// vu17HiRN7Ijmh60v0DJo1xSK/44=
const KEY = '455d292c-b385-4e56-ba22-3776b4d08193';
const METHOD = 'DELETE';
const SERVICE = 'authentication';
const date = '2022-10-15T16:33:06'; // (new Date()).toISOString().slice(0, 19);
const IDENTIFIER = '4035e459-691d-4e7c-8b37-135d36c3269d';

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
