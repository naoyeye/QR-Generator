var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var qr = require('qr-image');
var cache = require('memory-cache');

module.exports = {
    gen : function (req, res) {
        var getParam = function (param) {
            var shorten = param[0];
            return req.query[param] || req.query[shorten] || req.body[param] || req.body[shorten];
        };

        var size = (getParam('size') || 100) / 10;
        var width = size[0];
        var height = size[1];
        var encoding = getParam('encoding') || 'utf-8';
        var content = getParam('content');
        var leven = getParam('leven') || 'M';
        var margin = parseInt(getParam('margin')) || 2;

        var options = {
            type : 'png',
            size : size,
            encoding : encoding,
            ec_level : leven,
            margin : margin
        };

        if (content !== undefined) {
            var target = qr.image(content, options);

            var seed = content + size + encoding + leven + margin;

            var filename = '';
            var cachedFilename = cache.get(seed);

            if (!cachedFilename) {
                filename = crypto.createHash('md5').update(seed).digest('hex');

                // Cache for one day
                cache.put(seed, filename, 1000 * 60 * 60 * 24);
            } else {
                filename = cachedFilename;
            }

            var filePath = path.resolve(__dirname, '../../caches', filename + '.png');

            var readAndSendFile = function () {
                res.header('Content-Type', 'image/png');

                var readStream = fs.createReadStream(filePath);

                readStream.pipe(res);
            };

            fs.exists(filePath, function (exists) {
                if (exists) {
                    readAndSendFile.call(this);
                } else {
                    target.pipe(fs.createWriteStream(filePath));

                    target.on('end', readAndSendFile);
                }
            });     
        } else {
            res.send({
                error : 'Specify content pls. '
            });
        }
    }
};
