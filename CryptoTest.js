import crypto from 'crypto';

const KEY = 'c6226485-9c73-4564-b7fe-80c1fc32fd53';
const METHOD = 'DELETE';
const SERVICE = 'authentication';
const date = '2022-10-16T19:36:02'; // (new Date()).toISOString().slice(0, 19);
const IDENTIFIER = 'a41e01b6-d503-46b7-9e28-edae5b4ce98a';

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
