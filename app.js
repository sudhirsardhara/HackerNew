const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhosy',
  user: 'admin',
  password: 'admin',
  database: 'ticket',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


app.put('/tickets/:seatNumber', async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const { isOpen, userDetails } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query('UPDATE tickets SET isOpen = ?, userDetails = ? WHERE seatNumber = ?',
        [isOpen, JSON.stringify(userDetails), seatNumber]);

      await connection.commit();
      res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tickets/:seatNumber', async (req, res) => {
  try {
    const { seatNumber } = req.params;

    const [rows] = await pool.query('SELECT * FROM tickets WHERE seatNumber = ?', [seatNumber]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tickets/closed', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets WHERE isOpen = false');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tickets/open', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets WHERE isOpen = true');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tickets/details/:seatNumber', async (req, res) => {
  try {
    const { seatNumber } = req.params;

    const [rows] = await pool.query('SELECT userDetails FROM tickets WHERE seatNumber = ?', [seatNumber]);

    if (rows.length > 0 && rows[0].userDetails) {
      res.json(JSON.parse(rows[0].userDetails));
    } else {
      res.status(404).json({ error: 'Ticket not found or no user details available' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/admin/reset', async (req, res) => {
  try {
    await pool.query('UPDATE tickets SET isOpen = true, userDetails = NULL');
    res.json({ message: 'Server reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});