const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server for Socket.io
const server = http.createServer(app);

// ─── CORS Configuration ────────────────────────────────────────────────────────
// Configured to allow requests from both the React client and a mobile app
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',      // Alternate dev port
  'http://localhost:8081',      // React Native / Expo
  'exp://192.168.*.*:8081',     // Expo on local network
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((allowed) => {
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ─── Socket.io Setup ────────────────────────────────────────────────────────────
// Real-time communication for SOS alerts and live updates
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
});

// Make io accessible in routes/controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // Join a room based on user role (for targeted SOS alerts)
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`📡 Socket ${socket.id} joined room: ${room}`);
  });

  // SOS Alert — broadcast to all admins and nearby vendors
  socket.on('sos-alert', (data) => {
    console.log('🚨 SOS Alert received:', data);
    io.to('SUPER_ADMIN').emit('sos-alert', data);
    io.to('STATION_VENDOR').emit('sos-alert', data);
    io.to('SERVICE_VENDOR').emit('sos-alert', data);
    io.to('HYBRID_VENDOR').emit('sos-alert', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ─── Body Parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EV Pulse API is running 🚗⚡',
    timestamp: new Date().toISOString(),
  });
});

// ─── Error Handler (must be after routes) ───────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 EV Pulse Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time SOS alerts`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}\n`);
});
