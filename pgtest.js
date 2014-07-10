var pg = require('pg');

var client = new pg.Client("postgres://postgres@192.168.78.56:5432/test");

client.on('drain', client.end.bind(client)); //disconnect client when all queries are finished
client.connect();

var first = client.query({
	text: "SELECT name,age,id FROM users WHERE name = $1",
	values: ['Jessie'],
	name: 'User Info'
});

first.on('row', function(row) {
	console.log(row);
});

var second = client.query({
	name: 'User Info',
	values: ['Tony']
});

second.on('row', function(row) {
	console.log(row);
});

//can still supply a callback method
var third = client.query({
	name: 'User Info',
	values: ['Tim']
}, function(err, result) {
	console.log(result);;
});


var delUser = client.query({
	text: "delete from users where id = $1",
	values:[''],
	name : "Delete Users"
});

var del = client.query({
	name :'Delete Users',
	values:['last']
});

del.on('row',function(row){
	console.log(row);
});