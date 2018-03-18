var express = require('express');
var router = express.Router();
var fs = require('fs');
var proj4 = require('proj4');

// TM Projectrion Setting (Korean)
const TMProjection = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';
// GRS80 Projection Setting
const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/paths/:mntCode/:FID?', function(req, res, next) {
  var mntCode = req.params.mntCode;
  var FID = req.params.FID;

  var coordinateFilePath = `public/mountain/${mntCode}_geojson`;
  // Hiking path files path in local
  var coordinateFiles = fs.readdirSync(coordinateFilePath);
  
  var mntFileName;
  
  for (let idx in coordinateFiles) {
    let fileName = coordinateFiles[idx];

    if (!fileName.match(/SPOT/)) {
      mntFileName = fileName;    
    }
  }

  var coordinateFile = fs.readFileSync(`${coordinateFilePath}/${mntFileName}`, 'utf8');

  // Hiking paths in file
  var coordinates = JSON.parse(coordinateFile)['features'];

  var mntPaths = new Array();

  for (let idx in coordinates) {
    let mntPath = {
      attributes: new Array(),
      paths: new Array(),
    };

    let routeAttr  = coordinates[idx]['attributes'];
    let routePaths = coordinates[idx]['geometry']['paths'][0];

    mntPath['attributes'] = routeAttr;

    for (let _idx in routePaths) {
      let coordinate = proj4(TMProjection, EPSG4019).forward(routePaths[_idx]);
      
      let _coordinates = {
        lng: coordinate[0],
        lat: coordinate[1],
      };

      mntPath['paths'][_idx] = _coordinates;
    }

    mntPaths[idx] = mntPath;
  }

  if (FID == undefined) {
    return res.json(mntPaths);
  }

  return res.json(mntPaths[FID]);
});

module.exports = router;
