import api from './api';

export const blogService = {
  // Get all blogs
  getAllBlogs: async (params = {}) => {
    try {
      console.log('🔄 BlogService: Making GET request to /blogs');
      const response = await api.get('/blogs', { params });
      console.log('✅ BlogService: Response received', {
        status: response.status,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      // Handle different response structures
      let blogsData = response.data;
      
      // If data has blogs property
      if (blogsData && blogsData.blogs && Array.isArray(blogsData.blogs)) {
        console.log('📝 BlogService: Using response.data.blogs');
        return blogsData.blogs;
      }
      
      // If data has data property
      if (blogsData && blogsData.data && Array.isArray(blogsData.data)) {
        console.log('📝 BlogService: Using response.data.data');
        return blogsData.data;
      }
      
      // If data is directly the array
      if (Array.isArray(blogsData)) {
        console.log('📝 BlogService: Using response.data directly (array)');
        return blogsData;
      }
      
      // If no blogs found but response is successful
      console.warn('⚠️ BlogService: No blogs array found in response, returning empty array');
      return [];
      
    } catch (error: any) {
      console.error('❌ BlogService: Error fetching blogs:', error);
      console.error('❌ BlogService: Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch blogs');
    }
  },

  // Get blog by ID
  getBlogById: async (id: string) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data.blog || response.data;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  // Get trending blogs
  getTrendingBlogs: async (limit = 5) => {
    try {
      const response = await api.get('/blogs/trending', { params: { limit } });
      return response.data.blogs || response.data;
    } catch (error) {
      console.error('Error fetching trending blogs:', error);
      throw error;
    }
  },

  // Create new blog
  createBlog: async (blogData: any) => {
    try {
      const response = await api.post('/blogs', blogData);
      return response.data.blog || response.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id: string, blogData: any) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data.blog || response.data;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id: string) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Generate AI blog
  generateAIBlog: async (aiData: any) => {
    try {
      const response = await api.post('/blogs/generate-ai', aiData);
      return response.data.blog || response.data;
    } catch (error) {
      console.error('Error generating AI blog:', error);
      throw error;
    }
  },

  // Get user's blogs
  getMyBlogs: async (params = {}) => {
    try {
      const response = await api.get('/blogs/user/my-blogs', { params });
      return response.data.blogs || response.data;
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      throw error;
    }
  }
};

export default blogService;