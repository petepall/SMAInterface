import pino from 'pino';

const log = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
		},
	},
	level: 'info',
});

export default function logger (description, data) {
	return log.info(`${description} ${data}`);
}
