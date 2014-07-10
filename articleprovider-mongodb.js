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
  this.getCollection(function(error, article_collection) {
    if (typeof(id) != "undefined") {
      //debugger
      var ids;
      if (typeof(id) == "object") {
        ids = new Array(id.length);
        for (var i = 0; i < id.length; i++) {
          ids[i] = {};
          ids[i]._id = article_collection.db.bson_serializer.ObjectID.createFromHexString(id[i]);
          article_collection.remove(ids[i], {
            w: 1
          }, function(err, numberOfRemovedDocs) {
            callback(err, numberOfRemovedDocs);
          });
        }
      } else {
        ids = {
          _id: article_collection.db.bson_serializer.ObjectID.createFromHexString(id)
        };
        article_collection.remove(ids, {
          w: 1
        }, function(err, numberOfRemovedDocs) {
          callback(err, numberOfRemovedDocs);
        });
      }
      console.log(ids);

    }
    callback(error);
  });
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
