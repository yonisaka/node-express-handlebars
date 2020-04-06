const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const hbs = require('handlebars');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const multer = require('multer');

 
//Config Conn
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs'
});
 
//Conn
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected');
});

app.engine('handlebars', exphbs({ 
	defaultLayout: 'main',
	layoutsDir: path.join(__dirname,'views/layouts')
}));
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static(__dirname + '/public'));

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

//storage image
const storage = multer.diskStorage({
	destination : path.join(__dirname + '/public/upload/'),
	filename: function(req, file, cb){
		cb(null, file.fieldname + '-' + Date.now() +
		path.extname(file.originalname)
		);
	}
});

const upload = multer ({
	storage : storage
}).single('image');

//Routing
app.get('/',(req, res) => {
	let sql = "select * from article";
	let query = conn.query(sql, (err, results) => {
		if(err) throw err;
		res.render('home',{
			results: results,
			title: "Home"
		});
	});
});

app.get('/home/view/:id',(req, res) => {
	let data = req.params.id;
	let sql = "select * from article where id ="+ data +"";
	let query = conn.query(sql, (err, results) => {
		if(err) throw err;
		res.render('view',{
			results: results,
			title: "Post"
		});
	  });
});

app.get('/about',(req, res) => {
	res.render('about',{
		title: "About"
	});
});

app.get('/admin',(req, res) => {
	let sql = "select * from article";
	let query = conn.query(sql, (err, results) => {
		if(err) throw err;
		res.render('admin',{
			results: results,
			title: "Admin"
		});
	});
});

app.get('/admin/post',(req, res) => {
	res.render('post',{
		title: "Post"
	});
});

app.post('/admin/post/save', function(req, res){
	upload(req, res, err => {
		if (err) throw err
			let title = req.body.title;
			let content = req.body.content;
			let image = req.file.filename;

			let sql = "INSERT INTO article (article_title, article_content, article_image) VALUES ('"+ title +"','"+ content +"','"+ image +"')";
			let query = conn.query(sql, function(err, results){
			res.redirect('/admin');
			})
	});
});

app.get('/admin/edit/:id',(req, res) => {
	let data = req.params.id;
	let sql = "select * from article where id ="+ data +"";
	let query = conn.query(sql, (err, results) => {
		if(err) throw err;
		res.render('edit',{
			results: results,
			title: "Edit"
		});
	  });
});

app.post('/admin/edit/:id/update',(req, res) => {
	upload(req, res, err => {
		if (err) throw err
			let id = req.body.id;
			let title = req.body.title;
			let content = req.body.content;
			let image = req.file.filename;

			let sql = "UPDATE article SET article_title = '"+ title +"', article_content = '"+ content +"', article_image = '"+ image +"' WHERE id = '"+ id +"' ";

			let query = conn.query(sql, function(err, results){
			res.redirect('/admin');
			})
	});
});

app.get('/admin/delete/:id',(req, res) => {
	let data = req.params.id;
	let sql = "delete from article where id = "+ data +"";
	let query = conn.query(sql, (err, results) => {
		if(err) throw err;
		  res.redirect('/admin');
	  });
});

//server listening
app.listen(8000, ()=>{
	console.log('Server is running at port 8000')
});