var url = require("url");
var dbUtil = require("./dbutil");
var log = require("../log");
var timeUtil = require("./TimeUtil");

var path = new Map();

console.log();
console.log();

function insertRCD(fromSite, referer, ip, clientId) {

    var connection = dbUtil.createConnection();
    var insertRCDSql = "insert into router_click_detail (from_site, referer, ip, client_id, ctime) values (?, ?, ?, ?, ?)";
    var insertRCDParams = [fromSite, referer, ip, clientId, timeUtil.getNowTime()];
    connection.connect();
    connection.query(insertRCDSql, insertRCDParams, function (error, result) {
        if (error != null) {
            log(error);
        }
    });
    connection.end();

}

function existRSByFromSiteAndDate(fromSite, date, success) {
    var connection = dbUtil.createConnection();
    var queryRSSql = "select * from router_statistic where from_site = ? and date = ?;";
    var queryRSParams = [fromSite, date];
    connection.connect();
    connection.query(queryRSSql, queryRSParams, function (error, result) {
        if (error != null) {
            log(error);
        } else {
            success(result);
        }
    });
    connection.end();
}

function insertRS(fromSite, date, pv, uv) {
    var connection = dbUtil.createConnection();
    var insertRSSql = "insert into router_statistic (from_site, pv, uv, date) values (?, ?, ?, ?)";
    var insertRSParams = [fromSite, pv, uv, date];
    connection.connect();
    connection.query(insertRSSql, insertRSParams, function (error, result) {
        if (error != null) {
            log(error);
        }
    });
    connection.end();
}

function updateRSByFromSiteAndDate(fromSite, date, pv, uv) {
    var connection = dbUtil.createConnection();
    var updateRSSql = "update router_statistic set pv = pv + ? , uv = uv + ? where from_site = ? and date = ?;";
    var updateRSParams = [pv, uv, fromSite, date];
    connection.connect();
    connection.query(updateRSSql, updateRSParams, function (error, result) {
        if (error != null) {
            log(error);
        }
    });
    connection.end();
}

function doRecord(fromSite, ip, referer, clientId) {

    insertRCD(fromSite, referer, ip, clientId);
    existRSByFromSiteAndDate(fromSite, timeUtil.getNowDate(), function (result) {
        if (result.length > 0) {
            updateRSByFromSiteAndDate(fromSite, timeUtil.getNowDate(), 1, 1);
        } else {
            insertRS(fromSite, timeUtil.getNowDate(), 1, 1);
        }
    });
}

function jump(request, response) {

    var pathName = url.parse(request.url).pathname;
    var referer = request.headers.referer ? request.headers.referer : "None";

    if (referer != "None") {
        referer = url.parse(referer).hostname;
    }

    log(pathName + " " + referer, "access.log");

    response.writeHead(302, {"location": "http://www.baidu.com"});
    response.end();

    try {
        doRecord(pathName, "0.0.0.0", referer, "null");
    } catch (e) {
        log(e);
    }
}
path.set("/jump/[a-zA-Z0-9_]{1,20}", jump);


module.exports.path = path;

