#!/usr/bin/env node

/* Load environment variables into apache/passenger
 * They're already loaded into the application but not the server env
 */
require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({
      hook: true,
      ignore: /(\/\.|~$|\.json|\.scss$)/i
    })) {
    return;
  }
}

require('./server.babel'); // babel registration (runtime transpilation for node)
require('../src/bot/server');
