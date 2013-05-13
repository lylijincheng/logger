var http = require('http')
  , url  = require('url')
  , fs   = require('fs')
  , qs   = require('querystring')

  , mime = require('mime');


var api = {
  "populate": {
    "method": "POST",
    "url": "/add"
  }
};

var filepath = __dirname + '/archive';

// File server
http.createServer(requestHandler).listen(8124);

function requestHandler(req, res) {

  if (req.url === api.populate.url && req.method === api.populate.method) {
    routeXHR(req, res);
  } else {
    routeFiles(__dirname + req.url, res);
  }

} 

function routeXHR(req, res) { 
  var body = '';

  var status = {
    "statusCode": 0,
    "statusText": "success"
  };

  req.on('data', function(chunk) {
    body += chunk.toString();
  })

  req.on('end', function() {
    var data = parseData(body, req);

    fs.appendFile(filepath + data.filename, data.string, function(err) {
      if (err) {
        status = {
          "statusCode": 1,
          "statusText": "failure"
        };
      }
    });

    res.end(JSON.stringify(status));
  });
}


function routeFiles(pathname, res) {

  fs.stat(pathname, function(err, stats) {
    if (err) {
      res.writeHead(404);
      res.write('Bad request 404\n');
      res.end();
    } else if (stats.isFile()) {
      var file, type;
      
      // content type
      type = mime.lookup(pathname);

      res.setHeader('Content-Type', type);
      res.statusCode = 200;

      file = fs.createReadStream(pathname);

      file.on("open", function() {
        file.pipe(res);
      });
      file.on("error", function(err) {
        console.log(err);
      });

    } else {
      res.writeHead(403);
      res.write('Directory access is forbidden');
      res.end();
    }
  });
}

function parseData(body, req) {
  var data, info, timeStamp, filename, lineno, type, message, file, ua; 

  data = qs.parse(body);
  info = qs.parse(data.info);

  timeStamp = info.timeStamp;
  filename  = info.filename;
  lineno    = info.lineno;
  type      = info.type;
  message   = info.message;

  ua = req.headers['user-agent'];
  ip = req.connection.remoteAddress + ':' + req.connection.remotePort;

  file = '/' + timeStamp.split(/\s/)[0] + '.log';

  return {
    "filename": file,
    "string": [timeStamp, ip, filename + ':' + lineno, type, message, ua].join('\t') + '\n'
  }
}



console.log('Server running at port: 8124');