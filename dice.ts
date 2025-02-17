/*dice.ts*/
import { trace, Span, SpanStatusCode, Exception, metrics } from '@opentelemetry/api';

const tracer = trace.getTracer('dice-lib');
const meter = metrics.getMeter('dice-lib');

const counter = meter.createCounter('dice-lib.rolls.counter', {})

function rollOnce(i: number, min: number, max: number) {
  return tracer.startActiveSpan(`rollOnce:${i}`, (span: Span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.end();
    return result;
  });
}

export function rollTheDice(rolls: number, min: number, max: number) {
  // Create a span. A span must be closed.
  return tracer.startActiveSpan('rollTheDice', 
    { attributes: {
      'dicelib.rolls': rolls.toString() }},
    (parentSpan: Span) => {
    const result: number[] = [];
    for (let i = 0; i < rolls; i++) {
      counter.add(1);
      result.push(rollOnce(i, min, max));
    }

    parentSpan.addEvent("Hello I am a span event", {
      "log.severity": "INFO",
    });


    try {
      throw "Error";
    } catch(e) {
      parentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: "an error happened"
      });
      parentSpan.recordException(e as Exception);
    }

    // Be sure to end the span!
    parentSpan.end();
    return result;
  });
}