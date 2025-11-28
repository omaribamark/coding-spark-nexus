require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// Fix for rate limiting on Render - trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration for 5M users on AWS with mobile app support
const allowedOrigins = [
  'capacitor://localhost',
  'http://localhost',
  'ionic://localhost',
  'http://localhost:8100',
  'https://e2280cef-9c3e-485b-aca5-a7c342a041ca.lovableproject.com',
  'https://hakikisha-backend.onrender.com',
  ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
].filter(Boolean);

app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('capacitor://') || origin.startsWith('ionic://')) {
        callback(null, true);
      } else {
        // In production, be more restrictive
        if (process.env.NODE_ENV === 'production') {
          callback(new Error(`CORS blocked for origin: ${origin}`), false);
        } else {
          callback(null, true); // Allow all in development
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Info'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  })
);

// Handle preflight requests
app.options('*', cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Default Root Route (Render health checks)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'hakikisha-backend',
    message: 'Welcome to Hakikisha Backend!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    service: 'hakikisha-backend'
  });
});

// Debug Routes
app.get('/api/debug/env', (req, res) => {
  res.json({
    server: 'Hakikisha Backend',
    status: 'running',
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST ? 'set' : 'not set',
      user: process.env.DB_USER ? 'set' : 'not set',
      name: process.env.DB_NAME ? 'set' : 'not set',
      schema: process.env.DB_SCHEMA || 'hakikisha'
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/debug/db', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query(
      'SELECT current_schema(), version(), current_database()'
    );

    // Check if tables exist
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'hakikisha' 
      ORDER BY table_name
    `);

    // Check if admin user exists
    const adminCheck = await db.query(
      'SELECT email, role FROM hakikisha.users WHERE email = $1', 
      ['crecocommunication@gmail.com']
    );

    // ==================== GOOGLE PLAY STORE BYPASS USERS CHECK - START ====================
    // Check if bypass users exist
    const bypassUsersCheck = await db.query(`
      SELECT email, role, is_verified, two_factor_enabled, registration_status 
      FROM hakikisha.users 
      WHERE email IN ('admin.bypass@hakikisha.com', 'factchecker.bypass@hakikisha.com', 'user.normal@hakikisha.com')
      ORDER BY role
    `);
    // ==================== GOOGLE PLAY STORE BYPASS USERS CHECK - END ====================

    res.json({
      success: true,
      database: {
        name: result?.rows?.[0]?.current_database || null,
        schema: result?.rows?.[0]?.current_schema || null,
        version: result?.rows?.[0]?.version || null,
        status: 'connected'
      },
      tables: {
        count: tables.rows.length,
        list: tables.rows.map(t => t.table_name)
      },
      admin: {
        exists: adminCheck.rows.length > 0,
        user: adminCheck.rows[0] || null
      },
      // ==================== GOOGLE PLAY STORE BYPASS USERS - START ====================
      bypass_users: {
        count: bypassUsersCheck.rows.length,
        users: bypassUsersCheck.rows,
        note: 'These users bypass email verification and 2FA for Google Play Store testing'
      },
      // ==================== GOOGLE PLAY STORE BYPASS USERS - END ====================
      message: 'Database connected successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed',
    });
  }
});

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'HAKIKISHA API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    admin: {
      email: 'crecocommunication@gmail.com',
      note: 'Default admin user is automatically created on server start'
    },
    // ==================== GOOGLE PLAY STORE BYPASS USERS - START ====================
    google_play_test_users: {
      note: 'The following users bypass email verification and 2FA for Google Play Store testing',
      users: [
        {
          role: 'admin',
          email: 'admin.bypass@hakikisha.com',
          password: 'AdminBypass2024!',
          features: 'Full admin access, no 2FA, auto-verified'
        },
        {
          role: 'fact_checker', 
          email: 'factchecker.bypass@hakikisha.com',
          password: 'FactCheckerBypass2024!',
          features: 'Fact checking access, no 2FA, auto-verified'
        },
        {
          role: 'user',
          email: 'user.normal@hakikisha.com', 
          password: 'UserNormal2024!',
          features: 'Regular user, no email verification, auto-approved'
        }
      ],
      warning: 'REMOVE THESE USERS AFTER GOOGLE PLAY STORE APPROVAL'
    }
    // ==================== GOOGLE PLAY STORE BYPASS USERS - END ====================
  });
});

// ==================== GOOGLE PLAY STORE TESTING ROUTES - START ====================
// DELETE AFTER GOOGLE PLAY STORE APPROVAL
app.get('/api/debug/test-users', async (req, res) => {
  try {
    const db = require('./config/database');
    
    const testUsers = await db.query(`
      SELECT 
        u.email, 
        u.username,
        u.role,
        u.is_verified,
        u.two_factor_enabled,
        u.registration_status,
        u.status,
        CASE 
          WHEN u.email = 'admin.bypass@hakikisha.com' THEN 'AdminBypass2024!'
          WHEN u.email = 'factchecker.bypass@hakikisha.com' THEN 'FactCheckerBypass2024!'
          WHEN u.email = 'user.normal@hakikisha.com' THEN 'UserNormal2024!'
          WHEN u.email = 'crecocommunication@gmail.com' THEN 'Creco@2024Comms'
          ELSE 'Unknown'
        END as test_password,
        CASE 
          WHEN u.role = 'fact_checker' THEN 
            (SELECT verification_status FROM hakikisha.fact_checkers WHERE user_id = u.id)
          ELSE 'N/A'
        END as fact_checker_status
      FROM hakikisha.users u
      WHERE u.email IN (
        'crecocommunication@gmail.com',
        'admin.bypass@hakikisha.com', 
        'factchecker.bypass@hakikisha.com', 
        'user.normal@hakikisha.com'
      )
      ORDER BY 
        CASE u.role
          WHEN 'admin' THEN 1
          WHEN 'fact_checker' THEN 2
          WHEN 'user' THEN 3
          ELSE 4
        END
    `);

    res.json({
      success: true,
      message: 'Test users for Google Play Store verification',
      users: testUsers.rows,
      login_instructions: {
        note: 'Use these credentials to test the app without email verification or 2FA',
        endpoints: {
          login: 'POST /api/v1/auth/login',
          body_format: {
            email: 'user@example.com',
            password: 'password'
          }
        }
      },
      reminder: 'Remove these test users after Google Play Store approval'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch test users'
    });
  }
});

app.get('/api/debug/verify-bypass', async (req, res) => {
  try {
    const db = require('./config/database');
    
    const requiredUsers = [
      'crecocommunication@gmail.com',
      'admin.bypass@hakikisha.com',
      'factchecker.bypass@hakikisha.com', 
      'user.normal@hakikisha.com'
    ];

    const users = await db.query(
      `SELECT email, role, is_verified, two_factor_enabled, registration_status, status 
       FROM hakikisha.users 
       WHERE email = ANY($1)`,
      [requiredUsers]
    );

    const foundEmails = users.rows.map(u => u.email);
    const missingUsers = requiredUsers.filter(email => !foundEmails.includes(email));
    
    const verificationResults = users.rows.map(user => ({
      email: user.email,
      role: user.role,
      status: 'OK',
      checks: {
        is_verified: user.is_verified ? '✅' : '❌',
        registration_approved: user.registration_status === 'approved' ? '✅' : '❌',
        two_factor_disabled: !user.two_factor_enabled ? '✅' : '❌',
        account_active: user.status === 'active' ? '✅' : '❌'
      },
      all_checks_passed: user.is_verified && 
                         user.registration_status === 'approved' && 
                         !user.two_factor_enabled && 
                         user.status === 'active'
    }));

    res.json({
      success: true,
      verification_report: {
        total_required: requiredUsers.length,
        total_found: users.rows.length,
        missing_users: missingUsers,
        results: verificationResults,
        summary: {
          ready_for_play_store: missingUsers.length === 0 && 
                               verificationResults.every(r => r.all_checks_passed),
          issues_detected: missingUsers.length > 0 || 
                          verificationResults.some(r => !r.all_checks_passed)
        }
      },
      next_steps: {
        if_issues: 'Run the database seed script: npm run db:seed',
        if_ready: 'All test users are ready for Google Play Store testing!'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to verify bypass users'
    });
  }
});
// ==================== GOOGLE PLAY STORE TESTING ROUTES - END ====================

// API Routes (v1)
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const claimRoutes = require('./src/routes/claimRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const factCheckerRoutes = require('./src/routes/factCheckerRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const pointsRoutes = require('./src/routes/pointsRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/fact-checker', factCheckerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/points', pointsRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

module.exports = app;

const DatabaseInitializer = require('../src/config/database-init');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize complete database with default admin
    await DatabaseInitializer.initializeCompleteDatabase();
    
    console.log('Database seeding completed successfully!');
    console.log('Default Admin Credentials:');
    console.log('   Email: crecocommunication@gmail.com');
    console.log('   Password: Creco@2024Comms');
    console.log('   Role: admin');
    
    // ==================== GOOGLE PLAY STORE BYPASS USERS - START ====================
    console.log('\n🎉 Google Play Store Test Users Created:');
    console.log('   👑 Admin: admin.bypass@hakikisha.com / AdminBypass2024!');
    console.log('   🔍 Fact Checker: factchecker.bypass@hakikisha.com / FactCheckerBypass2024!');
    console.log('   👤 Normal User: user.normal@hakikisha.com / UserNormal2024!');
    console.log('\n⚠️  IMPORTANT: These users bypass email verification and 2FA');
    console.log('   Use for Google Play Store testing only');
    console.log('   REMOVE AFTER APPROVAL by deleting the marked sections in database-init.js and server.js');
    // ==================== GOOGLE PLAY STORE BYPASS USERS - END ====================
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;