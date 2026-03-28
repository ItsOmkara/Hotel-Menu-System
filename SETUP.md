# Hotel Relax Restaurant & Bar - Menu Ordering System

## ✅ Changes Made

1. **Removed Scanner/QR Code** - Replaced with simple "Place Order" button
2. **Order Success Notification** - Shows "🎉 Order placed successfully! We will contact you soon."
3. **MySQL Database Integration** - Orders are saved to your local MySQL database
4. **Fallback Storage** - If MySQL server isn't running, orders save to localStorage

## 🚀 Quick Setup (5 minutes)

### Step 1: Database Setup
Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS hotel_relax;
USE hotel_relax;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  customer_address TEXT,
  total_amount DECIMAL(10,2),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered') DEFAULT 'pending',
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  item_name VARCHAR(255),
  item_size VARCHAR(50),
  item_price DECIMAL(10,2),
  quantity INT,
  item_added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### Step 2: Install Node.js Dependencies
```bash
cd "c:\Users\OMKAR\Downloads\Menu-Card-main"
npm install
```

### Step 3: Update MySQL Password
Edit `server.js` line 15-16:
```javascript
user: 'root',      // Change to your MySQL username
password: '',      // Change to your MySQL password
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Open Website
Go to: `http://localhost:3000`

## 📱 How It Works

1. **Add items to cart** - Browse menu and click "Add"
2. **Review cart** - Check quantities and total
3. **Place Order** - Click "Place Order" button
4. **Success Message** - See "🎉 Order placed successfully!"
5. **Database Saved** - Order stored in MySQL automatically

## 🗄️ Database Features

- **Orders Table**: Customer info, total, status, timestamp
- **Order Items Table**: Individual items with sizes, quantities, and timestamps
- **Dual Timestamps**: 
  - `order_time` (orders table) - When the entire order was placed
  - `item_added_time` (order_items table) - When each specific item was added
- **Status Tracking**: pending → confirmed → preparing → ready → delivered
- **API Endpoints**: View/manage orders programmatically

## 🔧 API Endpoints

- `GET http://localhost:3000/api/orders` - View all orders
- `POST http://localhost:3000/api/orders` - Create new order
- `GET http://localhost:3000/api/orders/1` - View specific order

## 📋 Order Status Flow

1. **pending** - Order just placed
2. **confirmed** - Order confirmed by staff
3. **preparing** - Food being prepared
4. **ready** - Ready for pickup/delivery
5. **delivered** - Order completed

## 🛠️ Troubleshooting

**Server won't start?**
- Check if port 3000 is free
- Run `npm install` again
- Check Node.js is installed

**Database connection error?**
- Verify MySQL is running
- Check username/password in server.js
- Ensure database `hotel_relax` exists

**Orders not saving?**
- Make sure server is running (`npm start`)
- Check browser console (F12) for errors
- Orders fallback to localStorage if MySQL fails

## 📊 View Orders

To see all orders in database:
```sql
SELECT * FROM orders ORDER BY order_time DESC;
```

To see order details with item timestamps:
```sql
SELECT o.*, oi.item_name, oi.quantity, oi.item_price, oi.item_added_time 
FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.id = 1
ORDER BY oi.item_added_time;
```

To track when items were added to cart:
```sql
SELECT 
  item_name, 
  item_size, 
  quantity, 
  item_price,
  item_added_time,
  DATE_FORMAT(item_added_time, '%h:%i:%s %p') as time_added
FROM order_items 
WHERE order_id = 1;
```

---

**Ready to go!** Your restaurant ordering system is now connected to MySQL database. 🎉
