const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Session middleware
app.use(session({
  secret: 'hotel-relax-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// JWT Secret
const JWT_SECRET = 'hotel-relax-jwt-secret-2024';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Change to your MySQL username
  password: 'sharada',      // Change to your MySQL password
  database: 'hotel_relax'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database!');
  
  // Create database and tables if they don't exist
  initializeDatabase();
});

function initializeDatabase() {
  // Create users/customers table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) UNIQUE,
      password VARCHAR(255) NOT NULL,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL,
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_email (email),
      INDEX idx_phone (phone)
    )
  `;

  // Create orders table
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(20),
      customer_address TEXT,
      total_amount DECIMAL(10,2),
      status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
      order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      INDEX idx_user_id (user_id)
    )
  `;
  
  // Create order_items table
  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      item_name VARCHAR(255),
      item_size VARCHAR(50),
      item_price DECIMAL(10,2),
      quantity INT,
      item_added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `;
  
  connection.query(createUsersTable, (err) => {
    if (err) console.error('Error creating users table:', err);
  });
  
  connection.query(createOrdersTable, (err) => {
    if (err) console.error('Error creating orders table:', err);
  });
  
  // Check and add user_id column to existing orders table if it doesn't exist
  const checkOrdersColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hotel_relax' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'user_id'
  `;
  
  connection.query(checkOrdersColumnQuery, (err, results) => {
    if (err) {
      console.error('Error checking orders column:', err);
      return;
    }
    
    if (results.length === 0) {
      // Column doesn't exist, add it
      const addOrdersColumnQuery = `
        ALTER TABLE orders 
        ADD COLUMN user_id INT
      `;
      
      connection.query(addOrdersColumnQuery, (err) => {
        if (err) {
          console.error('Error adding user_id column to orders:', err);
        } else {
          console.log('Added user_id column to orders table');
          
          // Add foreign key constraint
          const addForeignKeyQuery = `
            ALTER TABLE orders 
            ADD FOREIGN KEY (user_id) REFERENCES users(id)
          `;
          
          connection.query(addForeignKeyQuery, (err) => {
            if (err) {
              console.error('Error adding foreign key to orders:', err);
            } else {
              console.log('Added foreign key constraint to orders table');
            }
          });
        }
      });
    } else {
      console.log('user_id column already exists in orders table');
    }
  });
  
  connection.query(createOrderItemsTable, (err) => {
    if (err) console.error('Error creating order_items table:', err);
  });
  
  // Check and add item_added_time column to existing table if it doesn't exist
  const checkColumnQuery = `
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hotel_relax' 
    AND TABLE_NAME = 'order_items' 
    AND COLUMN_NAME = 'item_added_time'
  `;
  
  connection.query(checkColumnQuery, (err, results) => {
    if (err) {
      console.error('Error checking column:', err);
      return;
    }
    
    if (results.length === 0) {
      // Column doesn't exist, add it
      const addColumnQuery = `
        ALTER TABLE order_items 
        ADD COLUMN item_added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `;
      
      connection.query(addColumnQuery, (err) => {
        if (err) {
          console.error('Error adding item_added_time column:', err);
        } else {
          console.log('Added item_added_time column to order_items table');
        }
      });
    } else {
      console.log('item_added_time column already exists');
    }
  });
}

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = ? OR phone = ?';
    connection.query(checkUserQuery, [email, phone], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User with this email or phone already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const insertUserQuery = `
        INSERT INTO users (name, email, phone, password, address) 
        VALUES (?, ?, ?, ?, ?)
      `;

      connection.query(insertUserQuery, [name, email, phone, hashedPassword, address], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Create JWT token
        const token = jwt.sign(
          { id: result.insertId, email, name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: result.insertId,
            name,
            email,
            phone,
            address
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const findUserQuery = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    connection.query(findUserQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      const updateLoginQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      connection.query(updateLoginQuery, [user.id]);

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const getProfileQuery = 'SELECT id, name, email, phone, address, created_at, last_login FROM users WHERE id = ?';
  connection.query(getProfileQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: results[0] });
  });
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

  const updateProfileQuery = `
    UPDATE users 
    SET name = ?, phone = ?, address = ? 
    WHERE id = ?
  `;

  connection.query(updateProfileQuery, [name, phone, address, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
});

// API Routes
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, total, notes } = req.body;
  const userId = req.user.id;
  
  // Start transaction
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Transaction failed:', err);
      return res.status(500).json({ error: 'Transaction failed' });
    }
    
    // Insert order with user_id
    const orderQuery = `
      INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    connection.query(orderQuery, [
      userId,
      req.user.name,
      req.user.phone || 'N/A',
      req.user.address || 'Raj Chamber, Kothla-Stand, Nagar',
      total,
      notes || ''
    ], (err, result) => {
      if (err) {
        console.error('Failed to create order:', err);
        connection.rollback();
        return res.status(500).json({ error: 'Failed to create order' });
      }
      
      const orderId = result.insertId;
      console.log('Order created with ID:', orderId);
      
      // Insert order items one by one for better compatibility
      let itemsInserted = 0;
      const totalItems = items.length;
      
      if (totalItems === 0) {
        connection.commit((commitErr) => {
          if (commitErr) {
            console.error('Failed to commit transaction:', commitErr);
            connection.rollback();
            return res.status(500).json({ error: 'Failed to commit transaction' });
          }
          
          res.status(201).json({
            message: 'Order placed successfully',
            orderId: orderId
          });
        });
        return;
      }
      
      items.forEach((item, index) => {
        const itemQuery = `
          INSERT INTO order_items (order_id, item_name, item_size, item_price, quantity)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        connection.query(itemQuery, [
          orderId,
          item.name,
          item.size,
          item.price,
          item.quantity
        ], (err) => {
          if (err) {
            console.error('Failed to add order item:', err);
            connection.rollback();
            return res.status(500).json({ error: 'Failed to add order items' });
          }
          
          itemsInserted++;
          
          // Commit transaction when all items are inserted
          if (itemsInserted === totalItems) {
            connection.commit((commitErr) => {
              if (commitErr) {
                console.error('Failed to commit transaction:', commitErr);
                connection.rollback();
                return res.status(500).json({ error: 'Failed to commit transaction' });
              }
              
              console.log('Order committed successfully with', totalItems, 'items');
              res.status(201).json({
                message: 'Order placed successfully',
                orderId: orderId
              });
            });
          }
        });
      });
    });
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT o.*, 
           COUNT(oi.id) as item_count,
           GROUP_CONCAT(CONCAT(oi.item_name, ' (', oi.quantity, ')') SEPARATOR ', ') as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.order_time DESC
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    
    res.json(results);
  });
});

// Get order details
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  
  // Get order info
  const orderQuery = 'SELECT * FROM orders WHERE id = ?';
  const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
  
  connection.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    
    if (orderResults.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    connection.query(itemsQuery, [orderId], (err, itemResults) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch order items' });
      }
      
      res.json({
        order: orderResults[0],
        items: itemResults
      });
    });
  });
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  
  connection.query(query, [status, orderId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update order status' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ message: 'Order status updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('MySQL database connection established');
});
