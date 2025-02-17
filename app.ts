/*app.ts*/
import express, { Express } from 'express';
import { rollTheDice } from './dice';
import { metrics, ValueType } from '@opentelemetry/api';
import winston from "winston"

const logger = winston.createLogger();
const meter = metrics.getMeter("dice-roll-server", "1.0");

const PORT: number = parseInt(process.env.PORT || '3000');
const app: Express = express();

app.get('/rolldice', (req, res) => {
  const histogram = meter.createHistogram("http.server.duration", {
    valueType: ValueType.INT
  })
  const startTime = new Date().getTime();
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;

  histogram.record(executionTime);
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

app.listen(PORT, () => {
  logger.info(`Listening for requests on http://localhost:${PORT}`);
});

