var mysql = require("mysql");



function createConnection() {
    var connection  = mysql.createConnection({
        host: "47.106.168.190",
        port: "3306",
        user: "root",
        password: "alkf@xpdw",
        database: "duyi_core"
    });

    return connection;
}

module.exports.createConnection = createConnection;