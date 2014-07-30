var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

ArticleProvider = function(host, port) {
  //this.db= new Db('node-mongo-blog', new Server(host, port, {auto_reconnect: true,}, {safe:false},{}));
  this.db = new Db('node-mongo-blog', new Server(host, port), {
    safe: false
  });
  this.db.open(function() {});
};

//getCollection

ArticleProvider.prototype.getCollection = function(callback) {
  this.db.collection('articles', function(error, article_collection) {
    if (error) callback(error);
    else callback(null, article_collection);
  });
};

//findAll
ArticleProvider.prototype.findAll = function(callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error)
    else {
      article_collection.find().sort({
        "created_at": -1
      }).toArray(function(error, results) {
        if (error) callback(error)
        else callback(null, results)
      });
    }
  });
};

//findById

ArticleProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error)
    else {
      article_collection.findOne({
        _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)
      }, function(error, result) {
        if (error) callback(error)
        else callback(null, result)
      });
    }
  });
};

//save
ArticleProvider.prototype.save = function(articles, callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error)
    else {
      if (typeof(articles.length) == "undefined")
        articles = [articles];

      for (var i = 0; i < articles.length; i++) {
        article = articles[i];
        article.created_at = new Date();
        if (article.comments === undefined) article.comments = [];
        for (var j = 0; j < article.comments.length; j++) {
          article.comments[j].created_at = new Date();
        }
      }

      article_collection.insert(articles, function() {
        callback(null, articles);
      });
    }
  });
};

ArticleProvider.prototype.removeById = function(id, callback) {
  console.log('Type of id :%s, Value is :%s', typeof(id), id);
  var images = [];
  var image = {};
  if (typeof(id) != "undefined") {
    this.getCollection(function(error, article_collection) {
      //debugger
      var ids;
      if (typeof(id) == "object") {
        ids = new Array(id.length);
        for (var i = 0; i < id.length; i++) {
          console.log("R index:" + i);
          //ids[i] = {};
          ids[i] = article_collection.db.bson_serializer.ObjectID.createFromHexString(id[i]);
        }

        var qStmt = {
          "_id": {
            $in: ids
          }
        };

        //get image path
        article_collection.find(qStmt).toArray(function(error, result) {
          for (var i = 0; i < result.length; i++) {
            console.log("MR-->" + result[i]._id.toHexString());
            if (error) callback(error)
            if (result[i].image != null && result[i].image.url != null) {
              console.log(i + "I-->" + result[i].image.url);
              image = result[i].image;
              images[i] = image;
            }
          };
        });
        //remove the artical
        //debugger
        //replacy ids[i] with result
        article_collection.remove(qStmt, {
          w: 1
        }, function(err, numberOfRemovedDocs) {
          //if (image != null) image.numberOfRemovedDocs = numberOfRemovedDocs;
          //images = image;
          console.log("MR Count-->" + numberOfRemovedDocs);
          callback(err, images);
        });
      } else {
        ids = {
          _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)
        };
        //get image path
        article_collection.findOne(ids, function(error, result) {
          console.log("R-->" + result);
          if (error) callback(error)
          else {
            image = result.image;
            console.log("R1-->" + result);
            if (image != null) console.log("I-->" + result.image.url);
            //images[0] = image;
          } //remove artical record         
          article_collection.remove(ids, {
            w: 1
          }, function(err, numberOfRemovedDocs) {
            console.log("R2-->" + result);
            if (image != null) image.numberOfRemovedDocs = numberOfRemovedDocs;
            images[0] = image;
            console.log("Del-->" + numberOfRemovedDocs);
            console.log("Del Image-->" + image);
            console.log("Del Images-->" + images);
            callback(err, images);
          });
        });

      }
    });
  } else {
    console.log("No Paramet ID");
    callback(error, images);
  }
};

ArticleProvider.prototype.addCommentToArticle = function(articleId, comment, callback) {
  this.getCollection(function(error, article_collection) {
    if (error) callback(error);
    else {
      article_collection.update({
          _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(articleId)
        }, {
          "$push": {
            comments: comment
          }
        },
        function(error, article) {
          if (error) callback(error);
          else callback(null, article)
        });
    }
  });
};

exports.ArticleProvider = ArticleProvider;