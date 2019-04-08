var express = require('express');
var router = express.Router();
var mysql = require('promise-mysql');
var fileUpload = require('express-fileupload');
var app = express();
app.use(fileUpload());

pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'myvacations',
  connectionLimit: 10
});


// Register new user to database 
router.post('/register', async (req, res) => {
  await pool.query(`INSERT INTO Users (role, firstname, lastname, username, password)  
     VALUES ('User', '${req.body.firstname}', '${req.body.lastname}', '${req.body.username}', '${req.body.password}' )  `)
  res.json({ status: "OK" });
});

// Login checked 

router.post('/signin', async (req, res) => {
  let userArr = await pool.query(`SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}' `)
  if (userArr.length > 0) {
    let currentUser = userArr[0];
    req.session.user = currentUser;
    let results = await pool.query(`SELECT * FROM Vacations`);
    let allVacations = results;
    res.json({ allVacations: allVacations, role: currentUser.role, username: currentUser.username, firstname: currentUser.firstname, isLogged: true });

  }
  else {
    res.json({ msg: "Username or password is incorrect!", type: "error" })
  }
});

// Logout
router.get('/logout', function (req, res) {
  req.session.role = "";
  req.session.username = "";

  res.json({
    vacations: [],
    isLogged: false,
    username: '',
    firstname:'',
    role: ''
  });
});


//  Add vacation to database
router.post('/addvacation', async (req, res, ) => {
  await pool.query(`INSERT INTO Vacations (details, destination, image, startdate, enddate, price, followers)  
    VALUES ('${req.body.details}', '${req.body.destination}', '${req.body.image}', '${req.body.startdate}', '${req.body.enddate}', ${req.body.price}, 0 )  `)
  res.json({ status: "OK" });
});

//  Edit vacation post
router.post('/edit', async (req, res, ) => {
  await pool.query(`UPDATE Vacations SET details='${req.body.details}' ,destination='${req.body.destination}', startdate='${req.body.startdate}',enddate='${req.body.enddate}', price=${req.body.price} WHERE id=${req.body.price}`)
  res.json({ status: "OK" });
});

// Delete post
router.get('/delete', async (req, res, ) => {
  await pool.query(`DELETE FROM Vacations WHERE id = ${req.query.id}`);
});


// Uploading Image
app.post('/upload', function (req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }
  let image = req.files.image;
  image.mv('./public/images/uploads', function (err) {
    if (err)
      return res.status(500).send(err);
    res.send('File uploaded!');
  });
});

module.exports = router;
