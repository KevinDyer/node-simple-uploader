(() => {
  'use strict';

  const PORT = process.env.PORT || 80;

  const os = require('os')
  const http = require('http')
  const express = require('express')
  const helmet = require('helmet')
  const morgan = require('morgan')
  const multer = require('multer')  

  class Server {
    constructor() {
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, os.tmpdir());
        },
        filename: function (req, file, cb) {
          cb(null, file.fieldname + '-' + Date.now());
        }
      })
      const upload = multer({storage: storage});

      const app = express();
      app.use(helmet());
      app.use(morgan('dev'));
      app.use(upload.any());
      app.use((req, res) => {
        console.log(require('util').inspect(req.files, {colors: true, depth: null}));
        res.status(200).json({success: true});
      });
      this._server = http.createServer(app);
    }

    listen(...params) {
      return new Promise((resolve, reject) => {
        this._server.once('error', reject);
        this._server.listen(...params, () => {
          this._server.removeListener('error', reject);
          resolve();
        });
      });
    }

    close() {
      return new Promise((resolve, reject) => {
        this._server.once('error', reject);
        this._server.close(() => {
          this._server.removeListener('error', reject);
          resolve();
        });
      });
    }
  }

  const server = new Server();
  server.listen(PORT)
  .then(() => console.log(`Listening on ${PORT}...`));

  process.on('SIGINT', () => {
    console.log(`Closing...`);
    server.close()
    .then(() => process.exit(0));
  })
})();
