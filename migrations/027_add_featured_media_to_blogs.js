/**
 * Migration: Add featured_image and video_url to blog_articles table
 * This allows fact checkers to include featured images and videos in their blog posts
 */

module.exports = {
  async up(db) {
    console.log('🔄 Adding featured_image and video_url columns to blog_articles table...');
    
    await db.query(`
      ALTER TABLE hakikisha.blog_articles 
      ADD COLUMN IF NOT EXISTS featured_image TEXT,
      ADD COLUMN IF NOT EXISTS video_url TEXT;
    `);
    
    console.log('✅ Featured media columns added to blog_articles table');
  },

  async down(db) {
    console.log('🔄 Removing featured_image and video_url columns from blog_articles table...');
    
    await db.query(`
      ALTER TABLE hakikisha.blog_articles 
      DROP COLUMN IF EXISTS featured_image,
      DROP COLUMN IF EXISTS video_url;
    `);
    
    console.log('✅ Featured media columns removed from blog_articles table');
  }
};
