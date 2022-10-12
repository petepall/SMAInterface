import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import pino from 'pino';
import { Parser } from 'xml2js';

dotenv.config();
// Definition of constant values
const { EMAIL } = process.env;
const { PASSWORD } = process.env;
const BASEURL = 'https://com.sunny-portal.de';

const METHOD = 'get';
const SERVICE = 'data';

const path = `/services/authentication/100/${EMAIL}?password=${PASSWORD}`;

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

const url = BASEURL + path;

let identify = null;
let key = null;

try {
	const xmlData = await axios.get(url);
	const data = await xmlData.data;

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

let plantoid = null;
const plantPath = `/services/plantlist/100/${identify}`;
const urlPlant = BASEURL + plantPath;

const plantData = await axios.get(urlPlant);
const dataPlant = await plantData.data;

parser.parseString(dataPlant, (error, result) => {
	logger.info(`Status code: ${plantData.status}`);
	logger.info(result);
	plantoid = result['sma.sunnyportal.services'].service.plantlist.plant.$.oid;
});

const date = (new Date()).toISOString().slice(0, 19);
logger.info(date);

// Generate signature token
const encoded = crypto.createHmac('sha1', key)
	.update(METHOD.toLowerCase())
	.update(SERVICE.toLowerCase())
	.update(date)
	.update(identify)
	.digest('base64');

logger.info(encoded);

// const plant = `/services/plant/100/${plantoid}?view=profile&culture=en-gb&plant-image-size=64px&identifier=${identify}&timestamp=${date}&signature-method=auth&signature-version=100&signature=${encoded}`;
const data = `/services/data/100/${plantoid}/overview-day-fifteen-total/2022-10-10?culture=en-gb&identifier=${identify}&timestamp=${date}&signature-method=auth&signature-version=100&signature=${encoded}`;
const urlPlantData = BASEURL + data;
logger.info(urlPlantData);

const plantInfo = await axios.get(urlPlantData);
const dataPlantInfo = await plantInfo.data;

parser.parseString(dataPlantInfo, (error, result) => {
	logger.info(`Status code: ${plantInfo.status}`);
	logger.info(result);
});
