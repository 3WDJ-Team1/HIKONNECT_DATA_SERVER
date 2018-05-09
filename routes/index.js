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
 *                HTTP request URL = host:3000/paths/{mntCode}/{FID}
 * 
 * @param String  req.params.mntCode   Mountain's serial code.
 * @param String  req.params.FID       Feature's ID.
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
// router.get('/paths/:mntCode/:FID?', function(req, res, next) {
//   // TM Projectrion Setting (Korean)
//   const KTMProjection = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';
//   // GRS80 Projection Setting
//   const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

//   var mntCode = req.params.mntCode;
//   var FID = req.params.FID;

//   // Hiking paths directory in local
//   var coordinateFilePath = `public/mountain/${mntCode}_geojson`;
//   // Hiking path files path in local
//   var coordinateFiles = fs.readdirSync(coordinateFilePath);
  
//   var mntFileName;
  
//   for (let idx in coordinateFiles) {
//     let fileName = coordinateFiles[idx];

//     if (!fileName.match(/^PMNTN_SPOT_/)) {
//       mntFileName = fileName;    
//     }
//   }

//   var coordinateFile = fs.readFileSync(`${coordinateFilePath}/${mntFileName}`, 'utf8');

//   // Hiking paths in file
//   var mntPaths = JSON.parse(coordinateFile)['features'];

//   for (let idx in mntPaths) {
//     if (FID != undefined && FID != idx) continue;

//     let routePaths = mntPaths[idx]['geometry']['paths'][0];

//     for (let _idx in routePaths) {
//       let coordinate = proj4(KTMProjection, EPSG4019).forward(routePaths[_idx]);
      
//       mntPaths[idx]['geometry']['paths'][0][_idx] = {
//         lat: coordinate[1],
//         lng: coordinate[0],
//       }
//     }
//   }

//   if (FID == undefined) {
//     return res.json(mntPaths);
//   } else {
//     return res.json(mntPaths[FID]);
//   }
// });

/** @todo 1. 등산 경로 서버로 요청 O
 *        2. 받아온 경로를 하나의 배열로 합침.
 *        3. 합친 배열로 각 FID의 전체 길이 계산.
 *        4. 계산 된 값을 DB에 입력할 수 있는 양식으로 반환.
 * */

router.get('/paths/:mntCode/:FID?', function(req, res, next) {
  // TM Projectrion Setting (Korean)
  const KTMProjection = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';
  // GRS80 Projection Setting
  const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  var mntCode = req.params.mntCode;
  var FID = req.params.FID;

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
              let idx = data['attributes']['FID'];
              if (FID != undefined && FID != idx) {
                return;
              }

              var routePaths = data['geometry']['paths'][0];

              routePaths.map((data, idx) => {
                let coordinate = proj4(KTMProjection, EPSG4019).forward(data);
                
                data = {
                  lat: coordinate[1],
                  lng: coordinate[0],
                }
                routePaths[idx] = data;
              });
          }))
          .then(() => {
            if (FID == undefined) {
              return res.json(mntPaths);
            } else if (mntPaths[FID] != undefined) {
              return res.json(mntPaths[FID]);
            } else {
              return res.sendStatus(404);
            }
          });
      });
    });
  });
});

/**
 * @function  This function returns important spot's coordinates converted from 
 *            TM projection to GRS80 Projection(degrees).
 *            HTTP request URL = host:3000/spots/{mntCode}/{FID}
 * @param String req.params.mntCode   Mountain's serial code.
 * @param String req.params.FID       Feature's ID.
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
router.get('/spots/:mntCode/:FID?', function(req, res, next) {
  var mntCode = req.params.mntCode;
  var FID     = req.params.FID;

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

  res.send(convert(coordinateFile['features'], FID));
});

/**
 * @function      This function returns safe spot's coordinates converted from 
 *                TM projection to GRS80 Projection(degrees).
 *                HTTP request URL = host:3000/paths/{mntCode}/{FID}
 * 
 * @param String  req.params.mntCode   Mountain's serial code.
 * @param String  req.params.FID       Feature's ID.
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
router.get('/safe-spot/:mntCode/:FID?', function(req, res, next) {
  var mntCode = req.params.mntCode;
  var FID     = req.params.FID;

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

  res.send(convert(coordinateFile['features'], FID));
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
 * @param     Number    FID           Coordinate feature's ID in data set.
 * 
 * @constant  String    KTMProjection K-TM projection = coordinate measure method that uses in Korea.
 * @constant  String    EPSG4019      GRS80(Geodetic Reference System) https://en.wikipedia.org/wiki/GRS_80
 * 
 * @return    Array                   Converted coordinate set.
 */
var convert = function(features, FID) {
  // KTM Projectrion Setting (Korean)
  const KTMProjection = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs';
  // GRS80 Projection Setting
  const EPSG4019 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

  for (let idx in features) {
    if (FID != undefined && FID != idx) continue;

    let x = parseFloat(features[idx]['geometry']['x']);
    let y = parseFloat(features[idx]['geometry']['y']);


    let convertedPosition = proj4(KTMProjection, EPSG4019).forward([x, y]);

    features[idx]['geometry'] = {
      lat: convertedPosition[1],
      lng: convertedPosition[0],
    };
  }

  if (FID == undefined) {
    return features;
  } else {
    return features[FID];
  }
}

module.exports = router;