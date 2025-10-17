const express = require('express');
const db = require('./conn');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));




// Routes
app.get('/', (req, res) => res.redirect('/login'));

// ---------------- LOGIN ----------------
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      // No session – just redirect directly
      res.redirect('/dashboard');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  });
});

// ---------------- SIGNUP ----------------
// Show signup page
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Handle signup form
app.post('/signup', (req, res) => {
  const { username, password, firstName, lastName, contactNo, empNo } = req.body;

  const sqlCheck = 'SELECT * FROM users WHERE username = ?';
  db.query(sqlCheck, [username], (err, result) => {
    if (err) throw err;

    if (result.length > 0) {
      
      // User already exists
      res.render('signup', { error: 'Username already exists' });
    } else {
      const sqlInsert = 'INSERT INTO users (username, password, firstName, lastName, contactNo, empNo) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sqlInsert, [username, password, firstName, lastName, contactNo, empNo], (err2) => {
        if (err2) throw err2;
        res.redirect('/login');
      });
    }
  });
});


// ---------------- DASHBOARD ----------------
app.get('/dashboard', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render('dashboard', { students: results });
  });
});

// ---------------- ADD STUDENT ----------------
app.get('/addStudent', (req, res) => {
  res.render('addStudent');
});

app.post('/addStudent', (req, res) => {
  const { student_id, name, course,year_level, total_tuition, monthly_allowance, financial_aid, parental_support, gwa } = req.body;

  const sql = `
    INSERT INTO students 
    (student_id, name, course,year_level, total_tuition, monthly_allowance, financial_aid, parental_support, gwa)
    VALUES (?,?,?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [student_id, name, course,year_level, total_tuition, monthly_allowance, financial_aid, parental_support, gwa], (err) => {
    if (err) {
      console.error('Error inserting student:', err);
      res.send('Error adding student.');
    } else {
      res.redirect('/dashboard');
    }
  });
});


// ---------------- EDIT STUDENT ----------------
app.get('/editStudent/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) throw err;
    res.render('editStudent', { student: results[0] });
  });
});

app.post('/updateStudent/:id', (req, res) => {
  const { name, course, year_level, total_tuition, monthly_allowance, financial_aid, parental_support, gwa } = req.body;
  const sql = `
    UPDATE students 
    SET name='${name}', course='${course}', year_level='${year_level}', 
        total_tuition='${total_tuition}', monthly_allowance='${monthly_allowance}', 
        financial_aid='${financial_aid}', parental_support='${parental_support}', gwa='${gwa}'
    WHERE id=${req.params.id}
  `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});


// ---------------- DELETE STUDENT ----------------
app.get('/delete-student/:id', (req, res) => {
  const sql = 'DELETE FROM students WHERE id = ?';
  db.query(sql, [req.params.id], err => {
    if (err) throw err;
    res.redirect('/dashboard');
  });
});

// ---------------- VIEW STUDENT ----------------
app.get('/viewStudent/:id', (req, res) => {
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) throw err;
    res.render('viewStudent', { student: results[0] });
  });
});

// --------------------- VIEW USER PROFILE ---------------------
app.get('/userProfile/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE id = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      res.send('Error fetching user data.');
    } else if (result.length > 0) {
      // Render the userProfile.ejs view and pass the user data
      res.render('userProfile', { user: result[0] });
    } else {
      res.send('User not found.');
    }
  });
});


// --------------------- EDIT USER PROFILE (GET FORM) ---------------------
app.get('/editProfile/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE id = ?';

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error loading user for editing:', err);
      res.send('Error loading user data.');
    } else if (results.length > 0) {
      // Render editProfile.ejs with the current user data
      res.render('editProfile', { user: results[0] });
    } else {
      res.send('User not found.');
    }
  });
});


// --------------------- UPDATE USER PROFILE (POST FORM) ---------------------
app.post('/updateProfile/:id', (req, res) => {
  const userId = req.params.id;
  const { username, firstName, lastName, contactNo, empNo } = req.body;

  const sql = `
    UPDATE users
    SET username = ?, firstName = ?, lastName = ?, contactNo = ?, empNo = ?
    WHERE id = ?
  `;

  db.query(sql, [username, firstName, lastName, contactNo, empNo, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      res.send('Error updating user profile.');
    } else {
      // Redirect back to the user's profile page after updating
      res.redirect('/userProfile/' + userId);
    }
  });
});



app.listen(9000, () => console.log('Server running on http://localhost:9000'));

