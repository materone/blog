var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//for upload
var multiparty = require('multiparty');
var format = require('util').format;
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
//var ArticleProvider = require('./articleprovider-memory').ArticleProvider;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', routes);
var articleProvider = new ArticleProvider('127.0.0.1', 27017);
//var articleProvider= new ArticleProvider();
app.get('/', function(req, res) {
  //debugger
  articleProvider.findAll(function(errors, docs) {
    res.render('index.jade', {
      title: 'Blog',
      articles: docs
    });
  });
})

app.get('/blog/new', function(req, res) {
  res.render('blog_new.jade', {
    title: 'New Post'
  });
});

app.post('/blog/new', function(req, res) {
  // create a form to begin parsing
  var form = new multiparty.Form();
  var image;
  var title;
  var body;

  form.on('error', function(err) {
    console.log(err);
  });
  form.on('close', function() {
    if (!image && typeof(image) != "undefined") {
      console.log(format('\nuploaded %s (%d Kb) as %s', image.filename, image.size / 1024 | 0, title));
    } else {
      console.log("no image upload");
    }
    //debugger
    articleProvider.save({
      title: title,
      body: body,
      image: image
    }, function(error, docs) {
      res.redirect('/')
    });

  });

  // listen on field event for title
  form.on('field', function(name, val) {
    switch (name) {
      case "title":
        title = val;
        break;
      case "body":
        body = val;
        break;
      default:
        console.log("In form on event");
    }
    return;

  });

  // listen on part event for image file
  form.on('part', function(part) {
    if (!part.filename) return;
    if (part.name !== 'image') return part.resume();
    image = {};
    image.filename = part.filename;
    image.size = 0;
    part.on('data', function(buf) {
      image.size += buf.length;
      //console.log('iii:' + buf.length);
      //var newPath = __dirname + "/uploads/"+part.filename;
      //fs.writeFile(newPath, buf, function(err) {
      //  console.log(err);
      //});
    });
  });

  // listen on part event for image file
  form.on('file', function(name, file) {
    +
      console.log(name);
    console.log(file.path);
    console.log(file.originalFilename);
    console.log(file.size);
    var saveTo = __dirname + "/public/uploads/" + file.originalFilename;
    if (file.size > 0) {
      fs.renameSync(file.path, saveTo);
      image = {};
      image.filename = file.path;
      image.size = file.size;
      image.url = "/uploads/" + file.originalFilename;
    }
    console.log(saveTo);
  });

  // parse the form
  form.parse(req);

});

app.get('/blog/:id', function(req, res) {

  articleProvider.findById(req.params.id, function(error, article) {
    res.render('blog_show.jade', {
      title: article.title,
      article: article
    });
  });
});

app.post('/blog/del', function(req, res) {
  articleProvider.removeById(req.param('id'), function(error, images) {
    console.log("MainR-->" + images);
    if (error) console.log(error);
    //remove image file
    images.forEach(function(image) {
      console.log("Loop:");
      console.log( image);
      if (image!=null && image.url) {
        var imgFilePath = __dirname + "/public" + image.url;
        fs.unlink(imgFilePath, function(err) {
          if (err) throw err;
          console.log('successfully deleted %s', image.url);
        });
      }
    });
  });
  console.log("Done in post del");
  res.redirect("/");
});

app.post('/blog/addComment', function(req, res) {
  articleProvider.addCommentToArticle(req.param('_id'), {
    person: req.param('person'),
    comment: req.param('comment'),
    created_at: new Date()
  }, function(error, docs) {
    res.redirect('/blog/' + req.param('_id'))
  });
});


app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;