exports.up = function(db) {
  return db.query(`
    CREATE TABLE IF NOT EXISTS hakikisha.media_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255),
      mime_type VARCHAR(100) NOT NULL,
      file_size INTEGER,
      file_data TEXT NOT NULL, -- Base64 encoded image data
      uploaded_by UUID REFERENCES hakikisha.users(id),
      upload_type VARCHAR(50) DEFAULT 'general', -- 'blog', 'claim', 'profile', 'general'
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX idx_media_files_uploaded_by ON hakikisha.media_files(uploaded_by);
    CREATE INDEX idx_media_files_upload_type ON hakikisha.media_files(upload_type);
    CREATE INDEX idx_media_files_created_at ON hakikisha.media_files(created_at);
  `);
};

exports.down = function(db) {
  return db.query(`
    DROP TABLE IF EXISTS hakikisha.media_files CASCADE;
  `);
};
