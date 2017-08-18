var express = require('express');
var soap = require('soap');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var path = require('path');
var moment = require('moment');
require('moment-precise-range-plugin');

var inLicense = fs.readFileSync('./license.txt', 'utf-8');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('index');
});

router.post('/verify', function(req, res) {
    var gmsfhm = req.body.id;
    var xm = req.body.name;

    if (!gmsfhm || !xm) {
        return res.status(400).send('Invalid parameter');
    }
    var args = { gmsfhm: gmsfhm, xm: xm };
    var inConditions = '<?xml version="1.0" encoding="utf-8"?>' +
        '<ROWS><INFO><SBM>上海星游纪信息技术有限公司</SBM></INFO>' +
        '<ROW><GMSFHM>公民身份号码</GMSFHM>' +
        '<XM>姓名</XM></ROW>' +
        '<ROW FSD="200333" YWLX="实名认证">' +
        '<GMSFHM>' + gmsfhm + '</GMSFHM>' +
        '<XM>' + xm + '</XM></ROW></ROWS>';
    soap.createClient(path.join(__dirname, '../NciicServices.wsdl'), function(err, client) {
        if (err) {
            res.status(500).send(err);
        } else {
            client.nciicCheck({ inLicense: inLicense, inConditions: inConditions }, function(err, response) {
                if (err) {
                    console.log("err:" + err);
                    res.status(503).send(err);
                } else {
                    console.log(response);
                    var xml = response.out;
                    parseString(xml, function(err, result) {
                        try {
                            var result_gmsfhm = result.ROWS.ROW[0].OUTPUT[0].ITEM[0].result_gmsfhm[0];
                            var result_xm = result.ROWS.ROW[0].OUTPUT[0].ITEM[1].result_xm[0];
                            if (result_gmsfhm === "一致" && result_xm === "一致") {

                                var birthDate = gmsfhm.slice(6, 14);
                                var year = birthDate.slice(0, 4);
                                var month = birthDate.slice(4, 6);
                                var day = birthDate.slice(6, 8);
                                res.status(200).send(isAdult(year + "-" + month + "-" + day + " 00:00:00") ? "实名认证成功,成年人" : "实名认证成功, 未成年人");
                            } else {
                                res.status(400).send('实名认证失败');
                            }
                        } catch (e) {
                            res.status(400).send('实名认证失败');
                        }
                    });
                }
            })
        }
    });
});

function isAdult(date) {
    var date = moment(date);
    return moment.preciseDiff(date, moment().format("L"), true).years > 17 ? true : false;
}

module.exports = router;