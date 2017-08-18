var express = require('express');
var soap = require('soap');
var fs = require('fs');
var axios = require('axios');
var path = require('path');
var inLicense = fs.readFileSync('./license.txt', 'utf-8');

var router = express.Router();

router.get('/', function (req, res) {
    res.render('index');
});

router.post('/verify', function (req, res) {
    var gmsfhm = req.body.id;
    var xm = req.body.name;

    if (!gmsfhm || !xm) {
        return res.status(400).send('Invalid parameter');
    }
    var args = {gmsfhm: gmsfhm, xm: xm};
    var inConditions = '<?xml version="1.0" encoding="utf-8"?>' +
      '<ROWS><INFO><SBM>上海星游纪信息技术有限公司</SBM></INFO>' +
      '<ROW><GMSFHM>公民身份号码</GMSFHM>' +
      '<XM>姓名</XM></ROW>' +
      '<ROW FSD="200333" YWLX="是否年满18周岁">' +
      '<GMSFHM>320107199211250313</GMSFHM>' +
      '<XM>邱叡</XM></ROW></ROWS>';
    soap.createClient(path.join(__dirname, '../NciicServices.wsdl'), function (err, client) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            client.nciicCheck({inLicense: inLicense, inConditions: inConditions}, function (err, response) {
                if (err) {
                    console.log("err:" + err);
                    res.status(503).send(err);
                }
                else {
                    console.log(response);
                    res.status(200).send(response.out);
                }
            })
        }
    });
});

module.exports = router;
