const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function testBypassLogin() {
  try {
    console.log('🔐 Testing Bypass Users Login Credentials\n');
    
    const testUsers = [
      {
        email: 'admin.bypass@hakikisha.com',
        password: 'AdminBypass2024!',
        description: 'Admin User - Bypasses 2FA & Email Verification'
      },
      {
        email: 'factchecker.bypass@hakikisha.com', 
        password: 'FactCheckerBypass2024!',
        description: 'Fact Checker User - Bypasses 2FA & Email Verification'
      },
      {
        email: 'user.normal@hakikisha.com',
        password: 'UserNormal2024!',
        description: 'Normal User - Bypasses Email Verification'
      },
      {
        email: 'crecocommunication@gmail.com',
        password: 'Creco@2024Comms',
        description: 'Default Admin User'
      }
    ];

    for (const user of testUsers) {
      console.log(`\n📧 Testing: ${user.email}`);
      console.log(`📝 Description: ${user.description}`);
      
      const result = await db.query(
        `SELECT id, email, username, password_hash, role, is_verified, 
                registration_status, two_factor_enabled, status 
         FROM hakikisha.users 
         WHERE email = $1`,
        [user.email]
      );

      if (result.rows.length > 0) {
        const dbUser = result.rows[0];
        const passwordValid = await bcrypt.compare(user.password, dbUser.password_hash);
        
        console.log(`✅ User exists: ${dbUser.email}`);
        console.log(`🔑 Password valid: ${passwordValid ? 'YES' : 'NO'}`);
        console.log(`👤 Role: ${dbUser.role}`);
        console.log(`✅ Email verified: ${dbUser.is_verified}`);
        console.log(`📋 Registration status: ${dbUser.registration_status}`);
        console(`🔒 2FA enabled: ${dbUser.two_factor_enabled}`);
        console.log(`📊 Status: ${dbUser.status}`);
        
        if (passwordValid) {
          console.log('🎉 LOGIN SUCCESS - Ready for Google Play Store testing!');
        } else {
          console.log('❌ LOGIN FAILED - Password mismatch');
        }
      } else {
        console.log('❌ User not found in database');
      }
      console.log('─'.repeat(50));
    }
    
  } catch (error) {
    console.error('Login test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testBypassLogin();
}

module.exports = testBypassLogin;