var fs = require('fs'),
    //https = require('https'),
    https = require('http'),
    formidable = require('formidable'),
    config = require('./config.js'),
    jsonPretty = require('json-pretty');

//https.createServer(config.httpsOptions, function (req, res) {
https.createServer(function (req, res) {
  if (req.method === 'POST') {
    form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      fs.readFile('./minion-config.js', function (err, data) {
        var obj;
        if (err) {
          res.writeHead(200);
          res.end('could not read ./minion-config.js', err);
        } else {
          try {
            obj = JSON.parse(data);
          } catch (e) {
            res.writeHead(200);
            res.end('could not parse ./minion-config.js', e);
            return;
          }
          obj = JSON.parse(data);
          obj.customers[fields.username] = {
            realName: fields.realName,
            otherEmail: fields.otherEmail
          };
          obj.assets.domains[fields.domain] = {
            application: fields.application,
            owner: fields.username
          };
          obj.assets.redirects['www.' + fields.domain] = {
            redirectHost: fields.domain,
            owner: fields.username
          };
          fs.writeFile('./minion-config.js', jsonPretty(obj), function (err2) {
            res.writeHead(200);
            res.end('updated minion-config', err2);
          });
        }
      });
    });
  } else {
    res.writeHead(200);
    console.log('piping out page');
    fs.createReadStream('./templates/main.html').pipe(res);
  }
}).listen(25499);
//console.log('see https://localhost:25499');
console.log('see http://localhost:25499');
