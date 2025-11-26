const BlogService = require('../services/blogService');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const axios = require('axios');

class BlogController {
  async createBlog(req, res) {
    try {
      console.log('creating new blog...');
      const { title, content, category, excerpt, featured_image, read_time, status = 'published' } = req.body;
      const author_id = req.user.userId;

      console.log('Blog data:', {
        title,
        category,
        author_id,
        has_content: !!content,
        content_length: content?.length,
        featured_image: featured_image ? 'Provided' : 'Not provided',
        status: status
      });

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required',
          code: 'VALIDATION_ERROR'
        });
      }

      // Handle featured image - it should be the URL from the upload endpoint
      let finalFeaturedImage = featured_image;
      
      // If featured_image is provided as base64, upload it first
      if (featured_image && featured_image.startsWith('data:image')) {
        try {
          console.log('Uploading base64 image...');
          const uploadResponse = await axios.post(
            `${req.protocol}://${req.get('host')}/api/v1/upload/image`, 
            { image: featured_image },
            { 
              headers: { 
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
              },
              timeout: 30000
            }
          );
          
          if (uploadResponse.data.success && uploadResponse.data.imageUrl) {
            finalFeaturedImage = uploadResponse.data.imageUrl;
            console.log('Featured image uploaded:', finalFeaturedImage);
          } else {
            console.warn('Image upload response missing imageUrl:', uploadResponse.data);
          }
        } catch (uploadError) {
          console.error('Failed to upload featured image:', uploadError.message);
          console.error('Upload error details:', uploadError.response?.data || uploadError.message);
          // Continue without featured image but log the issue
          finalFeaturedImage = null;
        }
      } else if (featured_image && featured_image.includes('uploads/')) {
        // If it's already an upload path, ensure it's a full URL
        if (!featured_image.startsWith('http')) {
          finalFeaturedImage = `${req.protocol}://${req.get('host')}/${featured_image}`;
          console.log('Converted upload path to full URL:', finalFeaturedImage);
        }
      }

      // Set published_at if status is published
      const publishedAt = status === 'published' ? new Date().toISOString() : null;

      const blogData = {
        title,
        content,
        author_id,
        category: category || 'fact_check',
        excerpt: excerpt || content.substring(0, 150) + '...',
        featured_image: finalFeaturedImage,
        read_time: read_time || Math.ceil(content.length / 200),
        status: status,
        published_at: publishedAt
      };

      console.log('Final blog data before creation:', {
        title: blogData.title,
        category: blogData.category,
        has_featured_image: !!blogData.featured_image,
        featured_image: blogData.featured_image ? 'Set' : 'Not set',
        status: blogData.status
      });

      const blog = await BlogService.createBlog(blogData);
      
      console.log('Blog created successfully:', blog.id);
      console.log('Blog status:', blog.status);
      console.log('Published at:', blog.published_at);
      console.log('Featured image in created blog:', blog.featured_image);

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        blog: blog
      });

    } catch (error) {
      console.error('Create blog error:', error);
      logger.error('Create blog error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create blog',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async publishBlog(req, res) {
    try {
      const { id } = req.params;
      console.log(`Publishing blog: ${id}`);

      const blog = await BlogService.publishBlog(id);
      
      console.log('Blog published successfully:', id);

      res.json({
        success: true,
        message: 'Blog published successfully',
        blog: blog
      });

    } catch (error) {
      console.error('Publish blog error:', error);
      logger.error('Publish blog error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to publish blog',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getBlogs(req, res) {
    try {
      console.log('Getting blogs...');
      const { category, limit = 10, offset = 0, author, status = 'published' } = req.query;

      let blogs;
      if (author === 'current' && req.user) {
        // Get current user's blogs
        blogs = await BlogService.getUserBlogs(req.user.userId, { 
          status: status,
          limit: parseInt(limit), 
          offset: parseInt(offset) 
        });
      } else {
        // Get public blogs - only published by default
        blogs = await BlogService.getBlogs({
          category,
          status: status,
          limit: parseInt(limit),
          offset: parseInt(offset)
        });
      }

      console.log(`Found ${blogs.length} blogs with status: ${status}`);
      
      // Log featured images for debugging
      blogs.forEach(blog => {
        console.log(`Blog: ${blog.title}, Featured Image: ${blog.featured_image || 'None'}`);
      });

      res.json({
        success: true,
        blogs: blogs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: blogs.length
        }
      });

    } catch (error) {
      console.error('Get blogs error:', error);
      logger.error('Get blogs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get blogs',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getBlog(req, res) {
    try {
      const { id } = req.params;
      console.log(`Getting blog: ${id}`);

      const blog = await BlogService.getBlogById(id);
      
      if (!blog) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
          code: 'NOT_FOUND'
        });
      }

      // Increment view count only for published blogs
      if (blog.status === 'published') {
        await BlogService.incrementViewCount(id);
      }

      console.log('Blog retrieved successfully:', id);
      console.log(`Blog featured image: ${blog.featured_image || 'None'}`);

      res.json({
        success: true,
        blog: blog
      });

    } catch (error) {
      console.error('Get blog error:', error);
      logger.error('Get blog error:', error);
      if (error.message === 'Blog not found') {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
          code: 'NOT_FOUND'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to get blog',
        code: 'SERVER_ERROR'
      });
    }
  }

  async updateBlog(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      console.log(`Updating blog: ${id}`, updateData);

      // Handle image updates
      if (updateData.featured_image && updateData.featured_image.startsWith('data:image')) {
        try {
          console.log('Uploading new featured image during update...');
          const uploadResponse = await axios.post(
            `${req.protocol}://${req.get('host')}/api/v1/upload/image`, 
            { image: updateData.featured_image },
            { 
              headers: { 
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (uploadResponse.data.success) {
            updateData.featured_image = uploadResponse.data.imageUrl;
            console.log('Featured image updated:', updateData.featured_image);
          }
        } catch (uploadError) {
          console.error('Failed to upload featured image during update:', uploadError.message);
          // Remove featured image if upload fails
          delete updateData.featured_image;
        }
      }

      // If status is being updated to published, set published_at
      if (updateData.status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const blog = await BlogService.updateBlog(id, updateData);
      
      console.log('Blog updated successfully:', id);

      res.json({
        success: true,
        message: 'Blog updated successfully',
        blog: blog
      });

    } catch (error) {
      console.error('Update blog error:', error);
      logger.error('Update blog error:', error);
      if (error.message === 'Blog not found') {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
          code: 'NOT_FOUND'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to update blog',
        code: 'SERVER_ERROR'
      });
    }
  }

  async deleteBlog(req, res) {
    try {
      const { id } = req.params;
      console.log(`Deleting blog: ${id}`);

      const blog = await BlogService.deleteBlog(id);
      
      console.log('Blog deleted successfully:', id);

      res.json({
        success: true,
        message: 'Blog deleted successfully'
      });

    } catch (error) {
      console.error('Delete blog error:', error);
      logger.error('Delete blog error:', error);
      if (error.message === 'Blog not found') {
        return res.status(404).json({
          success: false,
          error: 'Blog not found',
          code: 'NOT_FOUND'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to delete blog',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getTrendingBlogs(req, res) {
    try {
      console.log('Getting trending blogs...');
      const { limit = 5 } = req.query;

      const blogs = await BlogService.getTrendingBlogs(parseInt(limit));
      
      console.log(`Found ${blogs.length} trending blogs`);

      res.json({
        success: true,
        blogs: blogs
      });

    } catch (error) {
      console.error('Get trending blogs error:', error);
      logger.error('Get trending blogs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get trending blogs',
        code: 'SERVER_ERROR'
      });
    }
  }

  async searchBlogs(req, res) {
    try {
      const { q, limit = 10, offset = 0, status = 'published' } = req.query;
      console.log(`Searching blogs for: "${q}"`);

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const blogs = await BlogService.searchBlogs(q, {
        status: status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      console.log(`Found ${blogs.length} blogs for search: "${q}"`);

      res.json({
        success: true,
        blogs: blogs,
        query: q,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: blogs.length
        }
      });

    } catch (error) {
      console.error('Search blogs error:', error);
      logger.error('Search blogs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search blogs',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getBlogStats(req, res) {
    try {
      console.log('Getting blog statistics...');

      const stats = await BlogService.getBlogStats();
      
      console.log('Blog statistics retrieved:', stats);

      res.json({
        success: true,
        stats: stats
      });

    } catch (error) {
      console.error('Get blog stats error:', error);
      logger.error('Get blog stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get blog statistics',
        code: 'SERVER_ERROR'
      });
    }
  }

  async generateAIBlog(req, res) {
    try {
      console.log('Generating AI blog...');
      const { topic, claims, tone, length } = req.body;
      const author_id = req.user.userId;

      if (!topic) {
        return res.status(400).json({
          success: false,
          error: 'Topic is required for AI blog generation',
          code: 'VALIDATION_ERROR'
        });
      }

      const blog = await BlogService.generateAIBlog({
        topic,
        claims,
        tone,
        length,
        author_id
      });
      
      console.log('AI blog generated successfully:', blog.id);

      res.json({
        success: true,
        message: 'AI blog generated successfully',
        blog: blog
      });

    } catch (error) {
      console.error('Generate AI blog error:', error);
      logger.error('Generate AI blog error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate AI blog',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getMyBlogs(req, res) {
    try {
      console.log('Getting my blogs...');
      const { status, limit = 10, offset = 0 } = req.query;
      const author_id = req.user.userId;

      const blogs = await BlogService.getUserBlogs(author_id, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      console.log(`Found ${blogs.length} blogs for user: ${author_id}`);

      res.json({
        success: true,
        blogs: blogs,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: blogs.length
        }
      });

    } catch (error) {
      console.error('Get my blogs error:', error);
      logger.error('Get my blogs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get your blogs',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = new BlogController();