import fs from 'fs';
import pino from 'pino';
import * as rfs from 'rotating-file-stream';
import { environment } from '../config/environment';

// === Env toggles ===
const isProd = environment.isProduction;
const LOG_DIR = environment.logging.dir;
const LOG_LEVEL = environment.logging.level;
const SERVICE_NAME = environment.logging.service_name;
// Toggle pretty console (colored, single-line). When false, console is raw JSON.
const PRETTY_LOGS = environment.logging.pretty_log;

// Loki (direct) – if set, we will forward every log there too
const LOKI_URL = environment.loki.url;
const LOKI_BATCH_INTERVAL = environment.loki.batch_interval;
const LOKI_BASIC_AUTH = environment.loki.auth; // optional: "username:password"
const LOKI_LABELS = environment.loki.labels;

// ================== FS PREP ==================
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// ================== ROTATING FILE STREAM ==================
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * rfs calls this generator with:
 *  - time === undefined on initial stream (return the "current" filename)
 *  - time is a Date for rotations (return the rotated filename)
 *  - index increments when multiple rotations happen in the same interval (size-based)
 */
const fileNameGenerator = (time: Date, index?: number) => {
  if (!time) return 'app.log'; // current (active) file
  const y = time.getFullYear();
  const m = pad(time.getMonth() + 1);
  const d = pad(time.getDate());
  const idx = index ? `.${index}` : ''; // e.g., app-2025-09-03.1.log for extra rotations same day
  return `app-${y}-${m}-${d}${idx}.log`;
};

const rotatingFileStream = rfs.createStream(fileNameGenerator, {
  path: LOG_DIR,
  size: '10M', // rotate when file > 10MB
  interval: '1d', // rotate daily
  maxFiles: 20, // keep last 14 files
  compress: 'gzip', // gzip rotated files
  initialRotation: true
});

// ================== CONSOLE STREAM ==================
// If PRETTY_LOGS=true -> colored, single-line via pino-pretty
// Else -> raw JSON one-line (strict)
const consoleStream = PRETTY_LOGS
  ? (pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true, // <-- single-line
        translateTime: 'SYS:standard',
        // messageFormat can be customized; leaving default keeps full structure pretty-printed
      },
    }) as any)
  : process.stdout;

// ================== OPTIONAL: LOKI SENDER ==================
let lokiLogger: pino.Logger | null = null;
if (LOKI_URL) {
  const targets = [
    {
      target: 'pino-loki',
      level: LOG_LEVEL,
      options: {
        host: LOKI_URL,
        batching: true,
        interval: LOKI_BATCH_INTERVAL,
        labels: LOKI_LABELS,
        basicAuth: LOKI_BASIC_AUTH,
      },
    },
  ];
  lokiLogger = pino(
    {
      level: LOG_LEVEL,
      base: { service: SERVICE_NAME },
    },
    pino.transport({ targets }),
  );
}

// ================== HELPERS ==================
function genSimpleId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// ================== EXPORTED NESTJS-PINO CONFIG ==================
export const loggerConfig = {
  pinoHttp: {
    level: LOG_LEVEL,
    base: { service: SERVICE_NAME },

    // Keep consistent JSON keys
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,

    // Redact sensitive fields
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
        '*.password',
        '*.token',
      ],
      remove: true,
    },

    // Request ID support
    genReqId: (req, res) => {
      const existing =
        (req.headers['x-request-id'] as string) || (req as any).id;
      const id = existing || genSimpleId();
      res.setHeader('x-request-id', id);
      return id;
    },

    // Lean shapes
    serializers: {
      req(req) {
        return {
          id: (req as any).id,
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },

    customProps: (req) => ({
      requestId: (req as any).id,
    }),

    customReceivedMessage: (req) => `request_start ${req.method} ${req.url}`,
    customSuccessMessage: (req) => `request_completed ${req.method} ${req.url}`,
    customErrorMessage: (req, _res, err) =>
      `request_failed ${req.method} ${req.url} ${err?.message ?? ''}`,

    // === OUTPUTS: console + rotating file ===
    stream: (pino as any).multistream([
      { stream: consoleStream },
      { stream: rotatingFileStream },
    ]),

    // === TEE SAME JSON TO LOKI (if enabled) ===
    hooks: lokiLogger
      ? {
          logMethod(args, method) {
            try {
              // 1) write to console + file
              method.apply(this, args);
              // 2) forward identical payload to Loki
              (lokiLogger as pino.Logger)[this.level](...args);
            } catch {
              // never throw from logger
            }
          },
        }
      : undefined,
  },
};
