var express = require('express');
var soap = require('soap');
var fs = require('fs');
var path = require('path');
// var ca = fs.readFileSync(path.join(__dirname, '../certs', 'client', 'chain.pem'));
var inLicense = fs.readFileSync('./license.txt', 'utf-8');
var rootCas = require('ssl-root-cas/latest').create();
//rootCas
//    .addFile(path.join(__dirname, '../certs/intermediate.crt'));
// will work with all https requests will all libraries (i.e. request.js)
require('https').globalAgent.options.ca = rootCas;

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

    var url = "https://ws.nciic.org.cn/nciic_ws/services/NciicServices?wsdl";
    var args = {gmsfhm: gmsfhm, xm: xm};

    soap.createClient(url, function (err, client) {
        if (err) {
            console.error("error:", err);
            res.status(500).send(err);
        }
        else {
            client.nciicCheck({
                inLicense: inLicense,
                inConditions: '<?xml version="1.0" encoding="utf-8"?>' +
                '<ROWS><INFO><SBN>上海星游纪信息技术有限公司</SBN></INFO>' +
                '<ROW><GMSFHM>公民身份号码</GMSFHM>' +
                '<XM>姓名</XM></ROW>' +
                '<ROW FSD="200333" YWLX="是否年满18周岁">' +
                '<GMSFHM>320923198909300019</GMSFHM>' +
                '<XM>徐紫微</XM></ROW></ROWS>'
            }, function (err, response) {
                if (err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                else {
                    res.status(200).send(response);
                }
            })
        }
    });
});

module.exports = router;
