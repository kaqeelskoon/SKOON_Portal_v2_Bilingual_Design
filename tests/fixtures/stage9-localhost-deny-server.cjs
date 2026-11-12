'use strict';
/*
 * SKOON Stage 9 — ISOLATED localhost-only negative-test HTTP fixture.
 * NOT an ERP service, authentication system, Vercel function or production API.
 * It has no database connection and cannot issue permissions.
 * A real API must use independently reviewed server identity and tenant policies.
 */
const http = require('node:http');

function createDenyHandler() {
  return function denyHandler(request, response) {
    const path = new URL(request.url || '/', 'http://localhost').pathname;
    response.setHeader('Cache-Control', 'no-store, private');
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Vary', 'Origin');
    // Intentionally no Access-Control-Allow-Origin or Allow-Credentials.
    // This fixture never reads Authorization, cookies, roles, IDs or client claims.
    if (path !== '/api/stage9/directory' && !path.startsWith('/api/stage9/directory/')) {
      response.writeHead(404);
      response.end('{"error":"NOT_FOUND"}');
      return;
    }
    response.writeHead(403);
    response.end('{"error":"DENIED","canExecute":false,"policyApproved":false}');
  };
}

function startLocalFixture() {
  const server = http.createServer(createDenyHandler());
  return new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>{
      server.removeListener('error',reject);
      const address=server.address();
      resolve(Object.freeze({
        server,
        url:'http://127.0.0.1:'+address.port,
        close:()=>new Promise((yes,no)=>server.close(err=>err?no(err):yes()))
      }));
    });
  });
}
module.exports = Object.freeze({createDenyHandler,startLocalFixture});
