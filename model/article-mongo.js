var MongoClient = require('mongodb').MongoClient;
var db;


MongoClient.connect("mongodb://localhost:27017/test",function(err,database) {
	if (err) {throw err};
	db = database;
	console.log("Database Connpool inited");
	var admin = db.admin();
	admin.listDatabases(function(err,dbs) {
		dbs.databases.toArray(function(err,items) {
			console.log('%s', items);
		});
	});
	// var coll = db.collection("data");
	// coll.insertMany([{a:1},{a:2},{a:3}],function(err,result) {
	// 	if(err){
	// 		console.log("Insert error");
	// 		throw err;
	// 	}
	// 	console.log(result.result.n);
	// 	database.close();
	// });
});
