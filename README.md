# Create a new Node.js project
npm install express mysql2 body-parser


# MySQL Database:

CREATE TABLE tickets (
  seatNumber INT PRIMARY KEY,
  isOpen BOOLEAN DEFAULT true,
  userDetails JSON
);
# Run the Server:
node app.js

