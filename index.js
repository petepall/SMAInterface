import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import pino from 'pino';
import { Parser } from 'xml2js';

dotenv.config();

const { EMAIL } = process.env;
const { PASSWORD } = process.env;
const { BASEURL } = process.env;

const parser = new Parser({
	explicitArray: false,
});
const logger = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
});

function generateSignature(secret, method, service, identifier) {
	const timestamp = (new Date()).toISOString().slice(0, 19);
	return crypto.createHmac('sha1', secret)
		.update(method.toLowerCase())
		.update(service.toLowerCase())
		.update(timestamp)
		.update(identifier)
		.digest('base64');
}

// Initial connection to get the key and identifier
const authenticationPath = `/services/authentication/100/${EMAIL}?password=${PASSWORD}`;
let url = BASEURL + authenticationPath;
let identify = '';
let key = '';

const logAuthenticationPath = authenticationPath.replace(PASSWORD, '********');
logger.info(logAuthenticationPath);
let xmlData = {};

try {
	xmlData = await axios.get(url);
	const { data } = xmlData;

	parser.parseString(data, (error, result) => {
		if (!result['sma.sunnyportal.services'].service.error) {
			logger.info(`Status code: ${xmlData.status}`);
			logger.info(result['sma.sunnyportal.services']);
			identify = result['sma.sunnyportal.services'].service.authentication.$.identifier;
			key = result['sma.sunnyportal.services'].service.authentication.$.key;
		} else {
			logger.error(`Respone not OK message: ${result['sma.sunnyportal.services'].service.error.code}`);
		}
	});
} catch (error) {
	if (error.response) {
		console.log(error.response.data);
		console.log(error.response.status);
		console.log(error.response.headers);
	} else if (error.request) {
		console.log(error.request);
	} else {
		console.log('ERROR: ', error.message);
	}
}

// Get the plant data
let method = 'get';
let service = 'plantlist';
let plantoid = '';
let timestamp = (new Date()).toISOString().slice(0, 19);
const plantPath = `/services/plantlist/100/${identify}?timestamp=${timestamp}&signature-method=auth&signature-version=100&signature=${generateSignature(key, method, service, identify)}`;
url = BASEURL + plantPath;
let plantData = {};

logger.info(plantPath);
if (xmlData.status === 200) {
	try {
		plantData = await axios.get(url);

		parser.parseString(plantData.data, (error, result) => {
			logger.info(`Status code: ${plantData.status}`);
			logger.info(result);
			plantoid = result['sma.sunnyportal.services'].service.plantlist.plant.$.oid;
		});
	} catch (error) {
		if (error.response) {
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		} else if (error.request) {
			console.log(error.request);
		} else {
			console.log('ERROR: ', error.message);
		}
	}
}

// Get plant data for every 15 minutes of the day
method = 'get';
service = 'data';
const date = (new Date()).toISOString().slice(0, 10);
timestamp = (new Date()).toISOString().slice(0, 19);
const dataPath = `/services/data/100/${plantoid}/overview-day-fifteen-total/${date}?culture=en-gb&identifier=${identify}&timestamp=${timestamp}&signature-method=auth&signature-version=100&signature=${generateSignature(key, method, service, identify)}`;
url = BASEURL + dataPath;
logger.info(dataPath);
let plantInfo = {};

if (plantData.status === 200) {
	try {
		plantInfo = await axios.get(url);

		parser.parseString(plantInfo.data, (error, result) => {
			logger.info(`Status code: ${plantInfo.status}`);
			logger.info(result);
		});
	} catch (error) {
		if (error.response) {
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		} else if (error.request) {
			console.log(error.request);
		} else {
			console.log('ERROR: ', error.message);
		}
	}
}

// Delete the authorization token from the Sunny Portal
method = 'delete';
service = 'authentication';
timestamp = (new Date()).toISOString().slice(0, 19);

const deletePath = `/services/authentication/100/${identify}?timestamp=${timestamp}&signature-method=auth&signature-version=100&signature=${generateSignature(key, method, service, identify)}`;
url = BASEURL + deletePath;
logger.info(deletePath);

if (plantInfo.status === 200) {
	try {
		const end = await axios.delete(url);

		parser.parseString(end.data, (error, result) => {
			logger.info(`Status code: ${end.status}`);
			logger.info(result);
		});
	} catch (error) {
		if (error.response) {
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		} else if (error.request) {
			console.log(error.request);
		} else {
			console.log('ERROR: ', error.message);
		}
	}
}
