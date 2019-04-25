var express = require('express');
var router = express.Router();
var mySocketHelper = require('../utils/mysockethelper');
var mysql = require('promise-mysql');



pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'myvacations',
  connectionLimit: 10
});

var favorites = [];
// Register new user to database 
router.post('/register', async (req, res) => {
  let userArr = await pool.query(`SELECT * FROM users WHERE username = '${req.body.username}'`)
  if (userArr.length > 0) {
    res.json({ msg: 'Username already exists' });
  }
  else {
    await pool.query(`INSERT INTO Users (role, firstname, lastname, username, password)  
    VALUES ('User', '${req.body.firstname}', '${req.body.lastname}', '${req.body.username}', '${req.body.password}' )  `)
    res.json({ msg: `${req.body.firstname}` });
  }

});

// Login checked 
router.post('/signin', async (req, res) => {
  
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  if (req.session.user) {
          res.json({ allVacations: allVacations, role: req.session.user.role, username: req.session.user.username, firstname: req.session.user.firstname, isLogged: true });
  }
  else {
      let userArr = await pool.query(`SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}' `)
      if (userArr.length > 0) {
          let currentUser = userArr[0];
          req.session.user = currentUser;
          res.json({ allVacations: allVacations, role: currentUser.role, username: currentUser.username, firstname: currentUser.firstname, isLogged: true });
      }
      else {  
        if(req.body.username === undefined){
          res.json({ msg: "", type: ""});
        }
        else{
          res.json({ msg: "Username or password is incorrect!", type: "error" })
        } 
      }
  }
});

// Logout
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.json({ msg: "Logout" });
  
});

//chacking
router.get('/vacations', async (req, res) => {
      let results = await pool.query(`SELECT * FROM Vacations`);
      res.json(results);
});

//  Add vacation to database
router.post('/addvacation', async (req, res, ) => {
  await pool.query(`INSERT INTO Vacations (details, destination, image, startdate, enddate, price, followers)  
    VALUES ('${req.body.details}', '${req.body.destination}', '${req.body.image}', '${req.body.startdate}', '${req.body.enddate}', ${req.body.price}, 0 )  `)
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  res.json({ allVacations: allVacations });
  mySocketHelper.sendMessgae("vacationsChange");
});

//  Edit vacation post
router.post('/edit', async (req, res, ) => {
  await pool.query(`UPDATE Vacations SET details='${req.body.details}', destination='${req.body.destination}', startdate='${req.body.startdate}', enddate='${req.body.enddate}', price=${req.body.price} WHERE id=${req.body.id}`)
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  res.json({ allVacations: allVacations });
  mySocketHelper.sendMessgae("vacationsChange");
});   

// Delete post
router.get('/delete', async (req, res, ) => {
  await pool.query(`DELETE FROM Vacations WHERE id = ${req.query.id}`);
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  res.json({allVacations: allVacations });
  mySocketHelper.sendMessgae("vacationsChange");
});

// Follow Vacation 
router.post('/follow', async (req, res) => {
 let follow = await pool.query(`SELECT * FROM Vacations WHERE id=${req.body.val}`);
 let followerId = JSON.stringify(follow[0].id); 
 let followerPlus = JSON.stringify(follow[0].followers);   
 followerPlus++;
  await pool.query(`UPDATE Vacations SET followers=${followerPlus} WHERE id=${followerId}`)
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  let favorite = await pool.query(`SELECT * FROM Vacations WHERE id=${followerId}`);
  favorites.push(favorite[0]);
  favoritesArr = favorites.concat(allVacations);
  allVacations = favoritesArr;
  function getUnique(allVacations, comp) {
    const unique = allVacations.map(e => e[comp]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => allVacations[e]).map(e => allVacations[e]);
     return unique;
  };
allVacations=getUnique(allVacations,'id');
console.table(allVacations);
  res.json({allVacations: allVacations });
});

// Unfollow Vacation 
router.post('/unfollow', async (req, res) => {
  let unfollow = await pool.query(`SELECT * FROM Vacations WHERE id=${req.body.val}`);
 let followerId = JSON.stringify(unfollow[0].id); 
 let followerMinus = JSON.stringify(unfollow[0].followers);   
 followerMinus--;
  await pool.query(`UPDATE Vacations SET followers=${followerMinus} WHERE id=${followerId}`)
  let allVacations = await pool.query(`SELECT * FROM Vacations`);
  res.json({allVacations: allVacations });
});

router.get('/add', function (req, res) {
  res.redirect("/");

});
router.get('/graph', function (req, res) {
  res.redirect("/");
});

module.exports = router;
