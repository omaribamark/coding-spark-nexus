const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class BlogService {
  static async createBlog(blogData) {
    const {
      title,
      content,
      author_id,
      author_type = 'human',
      category = 'fact_check',
      source_claim_ids = [],
      trending_topic_id = null,
      status = 'draft',
      featured_image = null,
      read_time = 5,
      excerpt = null,
      published_at = null
    } = blogData;

    const id = uuidv4();
    
    // Generate excerpt from content if not provided
    let generatedExcerpt = excerpt;
    if (!generatedExcerpt && content) {
      generatedExcerpt = content.substring(0, 150) + (content.length > 150 ? '...' : '');
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);

    const query = `
      INSERT INTO hakikisha.blog_articles (
        id, title, content, excerpt, author_id, author_type, category, source_claim_ids,
        trending_topic_id, status, featured_image, read_time, slug, published_at, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *
    `;

    try {
      console.log('BlogService - Creating new blog with data:', {
        title,
        content_length: content?.length,
        author_id,
        category,
        excerpt_length: generatedExcerpt?.length,
        featured_image: featured_image ? `Set (${featured_image.substring(0, 50)}...)` : 'Not set',
        read_time,
        status,
        published_at
      });

      const result = await db.query(query, [
        id, 
        title, 
        content, 
        generatedExcerpt, 
        author_id, 
        author_type, 
        category,
        JSON.stringify(source_claim_ids), 
        trending_topic_id, 
        status,
        featured_image, 
        read_time, 
        slug,
        published_at
      ]);
      
      const createdBlog = result.rows[0];
      console.log('BlogService - Blog created successfully:', createdBlog.id);
      console.log('🖼️ Featured image in database:', createdBlog.featured_image);
      
      return createdBlog;
    } catch (error) {
      logger.error('Error creating blog article:', error);
      throw error;
    }
  }

  static async publishBlog(id) {
    const query = `
      UPDATE hakikisha.blog_articles 
      SET status = 'published', 
          published_at = COALESCE(published_at, NOW()),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Blog not found');
      }
      
      console.log('BlogService - Blog published successfully:', id);
      return result.rows[0];
    } catch (error) {
      logger.error('Error publishing blog:', error);
      throw error;
    }
  }

  static async getBlogById(id) {
    const query = `
      SELECT 
        ba.*, 
        u.email as author_email,
        u.username as author_name,
        u.profile_picture as author_avatar
      FROM hakikisha.blog_articles ba
      LEFT JOIN hakikisha.users u ON ba.author_id = u.id
      WHERE ba.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Blog not found');
      }
      
      const blog = result.rows[0];
      console.log(`BlogService - Retrieved blog: ${blog.title}, Featured Image: ${blog.featured_image || 'None'}`);
      
      return blog;
    } catch (error) {
      logger.error('Error finding blog by ID:', error);
      throw error;
    }
  }

  static async getBlogs(options = {}) {
    const {
      category,
      status = 'published',
      limit = 10,
      offset = 0,
      author_id = null
    } = options;

    let query = `
      SELECT 
        ba.*, 
        u.email as author_email,
        u.username as author_name,
        u.profile_picture as author_avatar
      FROM hakikisha.blog_articles ba
      LEFT JOIN hakikisha.users u ON ba.author_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND ba.category = $${paramCount}`;
      params.push(category);
    }

    if (status) {
      paramCount++;
      query += ` AND ba.status = $${paramCount}`;
      params.push(status);
    }

    if (author_id) {
      paramCount++;
      query += ` AND ba.author_id = $${paramCount}`;
      params.push(author_id);
    }

    // Order by published date for published blogs, created date for drafts
    if (status === 'published') {
      query += ` ORDER BY ba.published_at DESC NULLS LAST, ba.created_at DESC`;
    } else {
      query += ` ORDER BY ba.created_at DESC`;
    }

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    try {
      console.log('BlogService - Getting blogs with query:', { status, category, limit, offset });
      const result = await db.query(query, params);
      console.log(`BlogService - Found ${result.rows.length} blogs with status: ${status}`);
      
      // Log featured images for debugging
      result.rows.forEach(blog => {
        console.log(`📖 Blog "${blog.title}": Featured Image = ${blog.featured_image || 'None'}`);
      });
      
      return result.rows;
    } catch (error) {
      logger.error('Error getting blogs:', error);
      throw error;
    }
  }

  static async getUserBlogs(authorId, options = {}) {
    const {
      status,
      limit = 10,
      offset = 0
    } = options;

    return this.getBlogs({
      ...options,
      author_id: authorId,
      status: status
    });
  }

  static async getTrendingBlogs(limit = 5) {
    const query = `
      SELECT 
        ba.*, 
        u.email as author_email,
        u.username as author_name,
        u.profile_picture as author_avatar
      FROM hakikisha.blog_articles ba
      LEFT JOIN hakikisha.users u ON ba.author_id = u.id
      WHERE ba.status = 'published'
      ORDER BY ba.view_count DESC NULLS LAST, ba.published_at DESC
      LIMIT $1
    `;

    try {
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      logger.error('Error getting trending blogs:', error);
      throw error;
    }
  }

  static async incrementViewCount(id) {
    const query = `
      UPDATE hakikisha.blog_articles 
      SET view_count = COALESCE(view_count, 0) + 1,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating blog view count:', error);
      throw error;
    }
  }

  static async searchBlogs(queryText, options = {}) {
    const {
      status = 'published',
      limit = 10,
      offset = 0
    } = options;

    const query = `
      SELECT 
        ba.*, 
        u.email as author_email,
        u.username as author_name
      FROM hakikisha.blog_articles ba
      LEFT JOIN hakikisha.users u ON ba.author_id = u.id
      WHERE ba.status = $1
        AND (ba.title ILIKE $2 OR ba.content ILIKE $2 OR ba.excerpt ILIKE $2)
      ORDER BY 
        CASE 
          WHEN ba.title ILIKE $2 THEN 1
          WHEN ba.content ILIKE $2 THEN 2
          ELSE 3
        END,
        ba.published_at DESC
      LIMIT $3 OFFSET $4
    `;

    try {
      const result = await db.query(query, [
        status,
        `%${queryText}%`, 
        limit, 
        offset
      ]);
      return result.rows;
    } catch (error) {
      logger.error('Error searching blogs:', error);
      throw error;
    }
  }

  static async updateBlog(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE hakikisha.blog_articles 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Blog not found');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating blog:', error);
      throw error;
    }
  }

  static async deleteBlog(id) {
    const query = `
      DELETE FROM hakikisha.blog_articles 
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await db.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Blog not found');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting blog:', error);
      throw error;
    }
  }

  static async getBlogStats() {
    try {
      const totalResult = await db.query(`
        SELECT COUNT(*) as total_blogs 
        FROM hakikisha.blog_articles
      `);
      
      const publishedResult = await db.query(`
        SELECT COUNT(*) as published_blogs 
        FROM hakikisha.blog_articles 
        WHERE status = 'published'
      `);
      
      const draftResult = await db.query(`
        SELECT COUNT(*) as draft_blogs 
        FROM hakikisha.blog_articles 
        WHERE status = 'draft'
      `);
      
      const viewsResult = await db.query(`
        SELECT COALESCE(SUM(view_count), 0) as total_views 
        FROM hakikisha.blog_articles
      `);
      
      const recentResult = await db.query(`
        SELECT COUNT(*) as recent_blogs 
        FROM hakikisha.blog_articles 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);

      return {
        total_blogs: parseInt(totalResult.rows[0].total_blogs),
        published_blogs: parseInt(publishedResult.rows[0].published_blogs),
        draft_blogs: parseInt(draftResult.rows[0].draft_blogs),
        total_views: parseInt(viewsResult.rows[0].total_views),
        recent_blogs: parseInt(recentResult.rows[0].recent_blogs)
      };
    } catch (error) {
      logger.error('Error getting blog stats:', error);
      throw error;
    }
  }

  static async generateAIBlog(options) {
    const { topic, claims, tone, length, author_id } = options;
    
    const blogData = {
      title: `AI Generated: ${topic}`,
      content: `This is an AI-generated blog post about ${topic}. ${claims ? `Based on claims: ${claims.join(', ')}` : ''}`,
      author_id: author_id,
      author_type: 'ai',
      category: 'fact_check',
      status: 'draft',
      read_time: Math.ceil(length / 200) || 5
    };

    return this.createBlog(blogData);
  }
}

module.exports = BlogService;