var express = require('express');
var async = require('async');
var Zookeeper = require('zookeeper');
var path = require('path');

var zk = new Zookeeper({
  connect: 'ec2-54-92-24-33.ap-northeast-1.compute.amazonaws.com:2181',
  timeout: 200 * 1000,
  debug_level: Zookeeper.ZOO_LOG_LEVEL_WARN,
  host_order_deterministic: false
});

function cleanUp() {
  console.log('exiting');
  if (zk) {
    zk.close();
  }
  process.exit();
}

process.on('uncaughtException', cleanUp)
  .on('SIGINT', cleanUp);

var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/tree.json', function (req, res) {
  recurse('/', function(err, results) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
  });
});

zk.connect(function(err) {
  if (err) {
    throw err;
  }
  console.log('zk session established id=%s', zk.client_id);

  app.listen(5000);
});

// {
//   name: '',
//   data: '',
//   children: [
//     {
//       name: '',
//       data: '',
//       children: []
//     }
//   ]
// }
function recurse(path, callback) {
  var node = {
    name: path
  };
  zk.a_get(path, false, function(rc, error, stat, data) {
    node.data = data.toString('utf8');
  });
  zk.a_get_children(path, false, function(rc, error, children) {
    console.log(path, 'has:', children);
    async.map(children, function(child, cb) {
      var childPath;
      if (path.length > 1) {
        childPath = path + '/' + child;
      } else {
        childPath = path + child;
      }
      recurse(childPath, cb);
    }, function(err, childNodes) {
      if (err) return callback(err);
      node.children = childNodes;
      // TODO: Explicitly wait for data.
      callback(err, node);
    });
  });
}
