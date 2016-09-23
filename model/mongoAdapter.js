var MongoClient = require('mongodb').MongoClient;
var db = new Array();
var status = new Array();
MongoConn = function  (url) {
	if(url == null){
		console.log('URL is null');
		return -1;
	}
	if(status[url] == null ){
		console.log('init db conn');
		status[url]=false;

		MongoClient.connect(url,function(err,database) {
			if(err){
				db[url]=null;
				status[url]=null;
				return;
			}
			db[url]=database;
			status[url]=true;
			console.log(db);
		});
	} else{
		console.log('DB have been init');
	}
}

MongoConn.prototype.getDB = function(url) {
	console.log(status[url]);
	if(status[url]){
		console.log('Get DB OK');
		return db[url];
	}else{
		console.log('GET DB ERR');
	}
};

module.exports = MongoConn;