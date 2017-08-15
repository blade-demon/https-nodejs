var express = require('express');
var soap = require('soap');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var fs = require('fs');
var inLicense = fs.readFileSync('./license.txt', 'utf-8');

var rootCas = require('ssl-root-cas').create();
rootCas
  .addFile(__dirname + '../ssl/fullchain.pem')
  .addFile(__dirname + '../ssl/privatekey.pem')
;
require('https').globalAgent.options.ca = rootCas;

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/verify',bodyParser.urlencoded({extended:false}),function(req,res){
  var input = req.body;
  var gmsfhm = input.rows.row[1].gmsfhm;
  var xm = input.rows.row[1].xm;
  /*
  -beginning of soap body
  -url is defined to point to server.js so that soap cient can consume soap server's remote service
  -args supplied to remote service method
  */
  var url = "https://ws.nciic.org.cn/nciic_ws/services/NciicServices?wsdl";
  var args = {
    gmsfhm:gmsfhm,
    xm:xm
  };

  soap.createClient(url,function(err,client){
    if(err)
      console.error("error:", err);
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
      },function(err,response){
        if(err)
          console.error(err);
        else{
          console.log(response);
          res.send(response);
        }
      })
    }
  });
})

module.exports = router;
