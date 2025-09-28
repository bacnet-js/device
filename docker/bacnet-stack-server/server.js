
import { createServer } from 'node:http';
import { exec } from 'node:child_process';

const server = createServer((req, res) => {
  let buf = Buffer.alloc(0);
  req.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
  });
  req.on('end', () => {
    let cmd = buf.toString();
    if (cmd.length === 0 || !cmd.startsWith('bac')) {
      res.statusCode = 400;
      res.end('Invalid command');
      return;
    }
    cmd = `/bacnet-stack/bin/${cmd}`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        res.statusCode = 500;
        res.end(err.stack ?? err);
      } else {
        res.statusCode = 200;
        res.end(stdout);
      }
    });
  });
});

server.listen(3000, '0.0.0.0');
