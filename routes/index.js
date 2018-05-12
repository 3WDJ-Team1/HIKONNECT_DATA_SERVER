/**
 * 
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var proj4 = require('proj4');
var net = require('net');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/**
 * @function      This function returns hiking route's coordinates converted from 
 *                TM projection to GRS80 Projection(degrees).
 *                HTTP request URL = host:3000/paths/{mntCode}/{fid}
 * 
 * @param String  req.params.mntCode  Mountain's serial code.
 * @param String  req.params.fid      Feature's ID.
 * 
 * @const String  KTM_PROJ            KTM Projection(Korean) Setting for converting.
 * @const String  EPSG4019            GRS80 Projection setting for converting.  
 * 
 * @var   Array   coordinateFilePath  Coordinate file path in local storage.
 * @var   Array   coordinateFiles     Coordinate file list in local storage.
 * @var   String  mntFileName         Selected file name.
 * @var   Array   coordinateFile      JSON Object in local storage.
 *                                    This contains short description that hiking path.
 * @var   Array   mntPaths            Coordinates list in local file.
 * 
 * @return  null
 *          HTTP Response = String    The String is formatted by JSON syntax.
 */
router.get('/paths/:mntCode/:fid?', function(req, res, next) {
  // TM Projectrion Setting (Korean)
  const KTM_PROJ = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';

  // GRS80 Projection Setting
  const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  var mntCode = req.params.mntCode;
  var fid = req.params.fid;

  // Hiking paths directory in local
  let coordinateFilePath = `public/mountain/${mntCode}_geojson`;

  // Hiking path files path in local
  fs.readdir(coordinateFilePath, (err, coordinateFiles) => {
    if (coordinateFiles == undefined) {
      return res.sendStatus(404);
    }

    coordinateFiles.forEach((fileName, idx, arr) => {
      let mntFileName;

      if (fileName.match(/^PMNTN_SPOT_/) || fileName.match(/^PMNTN_SAFE_SPOT_/)) {
        return;
      }
      mntFileName = fileName;

      fs.readFile(
        `${coordinateFilePath}/${mntFileName}`, 
        {encoding: 'utf8'}, 
        (err, coordinateFile) => {
          // Hiking paths in file
          var mntPaths = JSON.parse(coordinateFile)['features'];

          Promise.all(mntPaths.map((data) => {
              let idx = data['attributes']['fid'];
              if (fid != undefined && fid != idx) {
                return;
              }

              var routePaths = data['geometry']['paths'][0];

              routePaths.map((data, idx) => {
                let coordinate = proj4(KTM_PROJ, EPSG4019).forward(data);
                
                data = {
                  lat: coordinate[1],
                  lng: coordinate[0],
                }
                routePaths[idx] = data;
              });
          }))
          .then(() => {
            if (fid == undefined) {
              return res.json(mntPaths);
            } else if (mntPaths[fid] != undefined) {
              return res.json(mntPaths[fid]);
            } else {
              return res.sendStatus(404);
            }
          });
      });
    });
  });
});

/**
 * 
 */
router.get('/dummy/school', (req, res, next) => {
  const DUMMY_DATA = [
    {
      "attributes" : {
        "FID"        : 0,
        "PMNTN_SN"   : 26719,
        "MNTN_CODE"  : "999999999",
        "MNTN_NM"    : "영진전문대학",
        "PMNTN_NM"   : "본관",
        "PMNTN_MAIN" : " ",
        "PMNTN_LT"   : 0.7,
        "PMNTN_DFFL" : "쉬움",
        "PMNTN_UPPL" : 1,
        "PMNTN_GODN" : 0,
        "PMNTN_MTRQ" : "",
        "PMNTN_CNRL" : " ",
        "PMNTN_CLS_" : " ",
        "PMNTN_RISK" : "",
        "PMNTN_RECO" : " ",
        "DATA_STDR_" : "2016-12-31",
        "MNTN_ID"    : "999999999"
      },
      "geometry": {
        "paths": [
          [
            {
              "lat": 35.896343, 
              "lng": 128.620824
            },
            {
              "lat": 35.896178, 
              "lng": 128.620832
            },
            {
              "lat": 35.896047,
              "lng": 128.620834
            },
            {
              "lat": 35.895902,
              "lng": 128.620858
            },
            {
              "lat": 35.895864,
              "lng": 128.621001
            },
            {
              "lat": 35.895817,
              "lng": 128.621191
            },
            {
              "lat": 35.895773,
              "lng": 128.621395
            },
            {
              "lat": 35.895741, 
              "lng": 128.621585
            },
            {
              "lat": 35.895691,
              "lng": 128.621760
            },
            {
              "lat": 35.895860,
              "lng": 128.621898
            },
            {
              "lat": 35.896031,
              "lng": 128.621848
            },
          ]
        ]
      }
    },
    {
      "attributes" : {
        "FID"        : 1,
        "PMNTN_SN"   : 26719,
        "MNTN_CODE"  : "999999999",
        "MNTN_NM"    : "영진전문대학",
        "PMNTN_NM"   : "본관",
        "PMNTN_MAIN" : " ",
        "PMNTN_LT"   : 1.2,
        "PMNTN_DFFL" : "쉬움",
        "PMNTN_UPPL" : 1,
        "PMNTN_GODN" : 0,
        "PMNTN_MTRQ" : "",
        "PMNTN_CNRL" : " ",
        "PMNTN_CLS_" : " ",
        "PMNTN_RISK" : "",
        "PMNTN_RECO" : " ",
        "DATA_STDR_" : "2016-12-31",
        "MNTN_ID"    : "999999999"
      },
      "geometry": {
        "paths": [
          [
            {
              "lat": 35.896031,
              "lng": 128.621848
            },
            {
              "lat": 35.896221, 
              "lng": 128.622179
            },
            {
              "lat": 35.896126,
              "lng": 128.622312
            },
            {
              "lat": 35.895993,
              "lng": 128.622460
            },
            {
              "lat": 35.895851,
              "lng": 128.622609
            },
            {
              "lat": 35.895750,
              "lng": 128.622758
            },
            {
              "lat": 35.895579,
              "lng": 128.622948
            },
            {
              "lat": 35.895471,
              "lng": 128.623120
            },
            {
              "lat": 35.895347,
              "lng": 128.623326
            },
            {
              "lat": 35.895249, 
              "lng": 128.623576
            },
          ]
        ]
      }
    }
  ];

  res.json(DUMMY_DATA);
});

/**
 * @desc  This function returns important spot's coordinates converted from 
 *        TM projection to GRS80 Projection(degrees).
 *        HTTP request URL = host:3000/spots/{mntCode}/{fid}
 * 
 * @param String req.params.mntCode   Mountain's serial code.
 * @param String req.params.fid       Feature's ID.
 * 
 * @var   Array   coordinateFilePath  Coordinate file path in local storage.
 * @var   Array   coordinateFiles     Coordinate file list in local storage.
 * @var   String  mntFileName         Selected file name.
 * @var   Array   coordinateFile      JSON Object in local storage.
 *                                    This contains short description that hiking path.
 * @var   Array   mntPaths            Coordinates list in local file.
 * 
 * @return  null
 *          HTTP Response = String    The String is formatted by JSON syntax.
 */
router.get('/spots/:mntCode/:fid?', function(req, res, next) {
  var mntCode = req.params.mntCode;
  var fid     = req.params.fid;

  var coordinateFilePath = `public/mountain/${mntCode}_geojson`;

  // Hiking path files path in local
  var coordinateFiles = fs.readdirSync(coordinateFilePath);
  
  var mntFileName;
  
  for (let idx in coordinateFiles) {
    let fileName = coordinateFiles[idx];

    if (fileName.match(/^PMNTN_SPOT_/)) {
      mntFileName = fileName;
    }
  }

  var coordinateFile = JSON.parse(fs.readFileSync(`${coordinateFilePath}/${mntFileName}`, 'utf8'));

  res.send(convert(coordinateFile['features'], fid));
});

/**
 * @function      This function returns safe spot's coordinates converted from 
 *                TM projection to GRS80 Projection(degrees).
 *                HTTP request URL = host:3000/paths/{mntCode}/{fid}
 * 
 * @param String  req.params.mntCode   Mountain's serial code.
 * @param String  req.params.fid       Feature's ID.
 * 
 * @var   Array   coordinateFilePath  Coordinate file path in local storage.
 * @var   Array   coordinateFiles     Coordinate file list in local storage.
 * @var   String  mntFileName         Selected file name.
 * @var   Array   coordinateFile      JSON Object in local storage.
 *                                    This contains short description that hiking path.
 * @var   Array   mntPaths            Coordinates list in local file.
 * 
 * @return  null
 *          HTTP Response = String    The String is formatted by JSON syntax.
 */
router.get('/safe-spot/:mntCode/:fid?', function(req, res, next) {
  var mntCode = req.params.mntCode;
  var fid     = req.params.fid;

  var coordinateFilePath = `public/mountain/${mntCode}_geojson`;
  // Hiking path files path in local
  var coordinateFiles = fs.readdirSync(coordinateFilePath);
  
  var mntFileName;
  
  for (let idx in coordinateFiles) {
    let fileName = coordinateFiles[idx];

    if (fileName.match(/^PMNTN_SAFE_SPOT_/)) {
      mntFileName = fileName;
    }
  }

  var coordinateFile = JSON.parse(fs.readFileSync(`${coordinateFilePath}/${mntFileName}`, 'utf8'));

  res.send(convert(coordinateFile['features'], fid));
});

/**
 * @author    bs Kwon <rnjs9957@gmail.com>
 * 
 * @desc      This function returns coordinate 
 *            that converted from PM projection to GRS80 projection(degrees).
 * 
 * @requires  proj4 (NPM Package)
 * 
 * @param     Array     features      Coordinate set provided by Korea Forest Service.
 * @param     Number    fid           Coordinate feature's ID in data set.
 * 
 * @constant  String    KTM_PROJ      K-TM projection = coordinate measure method that uses in Korea.
 * @constant  String    EPSG4019      GRS80(Geodetic Reference System) https://en.wikipedia.org/wiki/GRS_80
 * 
 * @return    Array                   Converted coordinate set.
 */
var convert = function(features, fid) {
  // KTM Projectrion Setting (Korean)
  const KTM_PROJ = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';
  // GRS80 Projection Setting
  const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  for (let idx in features) {
    if (fid != undefined && fid != idx) continue;

    let x = parseFloat(features[idx]['geometry']['x']);
    let y = parseFloat(features[idx]['geometry']['y']);


    let convertedPosition = proj4(KTM_PROJ, EPSG4019).forward([x, y]);

    features[idx]['geometry'] = {
      lat: convertedPosition[1],
      lng: convertedPosition[0],
    };
  }

  if (fid == undefined) {
    return features;
  } else {
    return features[fid];
  }
}

module.exports = router;