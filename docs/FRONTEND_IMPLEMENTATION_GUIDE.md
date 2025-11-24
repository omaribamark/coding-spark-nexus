# Frontend Implementation Guide - CRECO Fact-Checking Platform

## Overview
This guide provides detailed frontend implementation examples for integrating with the CRECO fact-checking platform API, with special focus on handling media content (images and videos) in claim submissions and blog posts.

---

## Table of Contents
1. [Claim Submission with Media](#claim-submission-with-media)
2. [Displaying Claim Details](#displaying-claim-details)
3. [Blog Creation with Featured Media](#blog-creation-with-featured-media)
4. [Fact Checker Dashboard](#fact-checker-dashboard)
5. [Image Upload Components](#image-upload-components)

---

## Claim Submission with Media

### Basic Claim Submission Form

```javascript
import { useState } from 'react';

const ClaimSubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: '',
    claimText: '',
    videoLink: '',
    sourceLink: '',
    imageUrl: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      setResponse(data);
      
      if (data.success) {
        // Show success message
        if (data.requiresHumanReview) {
          alert(data.reviewMessage);
        } else {
          alert('Claim submitted and AI processing started!');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Category Selection */}
      <select 
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
        required
      >
        <option value="">Select Category</option>
        <option value="politics">Politics</option>
        <option value="health">Health</option>
        <option value="education">Education</option>
        <option value="technology">Technology</option>
        <option value="business">Business</option>
        <option value="other">Other</option>
      </select>

      {/* Claim Text */}
      <textarea
        placeholder="Enter the claim you want to verify..."
        value={formData.claimText}
        onChange={(e) => setFormData({...formData, claimText: e.target.value})}
        required
        rows={6}
      />

      {/* Video Link */}
      <input
        type="url"
        placeholder="Video URL (optional)"
        value={formData.videoLink}
        onChange={(e) => setFormData({...formData, videoLink: e.target.value})}
      />

      {/* Source Link */}
      <input
        type="url"
        placeholder="Source URL (optional)"
        value={formData.sourceLink}
        onChange={(e) => setFormData({...formData, sourceLink: e.target.value})}
      />

      {/* Image URL */}
      <input
        type="url"
        placeholder="Image URL (optional)"
        value={formData.imageUrl}
        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Claim'}
      </button>

      {/* Response Message */}
      {response && response.requiresHumanReview && (
        <div className="info-box">
          <strong>Human Review Required:</strong>
          <p>{response.reviewMessage}</p>
        </div>
      )}
    </form>
  );
};

export default ClaimSubmissionForm;
```

### Claim Submission with Image Upload

```javascript
import { useState } from 'react';

const ClaimSubmissionWithUpload = () => {
  const [formData, setFormData] = useState({
    category: '',
    claimText: '',
    videoLink: '',
    sourceLink: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image file size must be less than 10MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image and get URL
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('evidence', imageFile);
      
      const response = await fetch('/api/claims/upload-evidence', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.fileUrl;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Submit claim with uploaded image
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Upload image first if present
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        alert('Failed to upload image. Please try again.');
        return;
      }
    }
    
    // Submit claim with image URL
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: imageUrl
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.requiresHumanReview) {
          alert(`✅ ${data.message}\n\n${data.reviewMessage}`);
        } else {
          alert('✅ Claim submitted successfully!');
        }
        
        // Reset form
        setFormData({
          category: '',
          claimText: '',
          videoLink: '',
          sourceLink: ''
        });
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit claim');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Category and text fields (same as before) */}
      
      {/* Image Upload */}
      <div className="image-upload-section">
        <label htmlFor="imageUpload">Upload Image Evidence (optional)</label>
        <input
          id="imageUpload"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
        />
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" style={{maxWidth: '300px'}} />
            <button 
              type="button" 
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Submit Claim'}
      </button>
    </form>
  );
};

export default ClaimSubmissionWithUpload;
```

---

## Displaying Claim Details

### Claim Details Component

```javascript
import { useState, useEffect } from 'react';

const ClaimDetails = ({ claimId }) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaimDetails();
  }, [claimId]);

  const fetchClaimDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/claims/${claimId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setClaim(data.claim);
      }
    } catch (error) {
      console.error('Error fetching claim:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!claim) return <div>Claim not found</div>;

  return (
    <div className="claim-details">
      <h2>{claim.title}</h2>
      
      {/* Category Badge */}
      <span className="category-badge">{claim.category}</span>
      
      {/* Status Badge */}
      <span className={`status-badge status-${claim.status}`}>
        {claim.status}
      </span>
      
      {/* Description */}
      <p className="description">{claim.description}</p>
      
      {/* Media Content */}
      {claim.mediaUrl && (
        <div className="media-section">
          <h3>Evidence Image</h3>
          <img 
            src={claim.mediaUrl} 
            alt="Claim evidence" 
            style={{maxWidth: '100%', height: 'auto'}}
          />
        </div>
      )}
      
      {claim.videoUrl && (
        <div className="media-section">
          <h3>Video Evidence</h3>
          <video controls style={{maxWidth: '100%'}}>
            <source src={claim.videoUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {claim.sourceUrl && (
        <div className="source-link">
          <strong>Source: </strong>
          <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer">
            {claim.sourceUrl}
          </a>
        </div>
      )}
      
      {/* Verdict Section */}
      {claim.verdict && (
        <div className={`verdict verdict-${claim.verdict}`}>
          <h3>Verdict: {claim.verdict.toUpperCase()}</h3>
          <p>{claim.verdictText}</p>
          
          {claim.sources && claim.sources.length > 0 && (
            <div className="sources">
              <h4>Evidence Sources:</h4>
              <ul>
                {claim.sources.map((source, index) => (
                  <li key={index}>
                    <a href={source} target="_blank" rel="noopener noreferrer">
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* AI Verdict Section (if available) */}
      {claim.ai_verdict && !claim.verdict && (
        <div className="ai-verdict">
          <h3>AI Analysis</h3>
          <p><strong>Verdict:</strong> {claim.ai_verdict.verdict}</p>
          <p><strong>Confidence:</strong> {(claim.ai_verdict.confidence_score * 100).toFixed(0)}%</p>
          <p>{claim.ai_verdict.explanation}</p>
          {claim.ai_verdict.disclaimer && (
            <p className="disclaimer">⚠️ {claim.ai_verdict.disclaimer}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;
```

---

## Blog Creation with Featured Media

### Blog Creation Form

```javascript
import { useState } from 'react';

const BlogCreationForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'fact_check',
    tags: [],
    featured_image: '',
    video_url: '',
    status: 'draft'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle featured image upload
  const handleImageUpload = async (file) => {
    // Upload to your storage service (e.g., AWS S3, Cloudinary)
    // This is a placeholder - implement your actual upload logic
    
    const formDataObj = new FormData();
    formDataObj.append('image', file);
    
    try {
      const response = await fetch('/api/upload/featured-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formDataObj
      });
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Upload featured image if present
    let featuredImageUrl = formData.featured_image;
    if (imageFile) {
      featuredImageUrl = await handleImageUpload(imageFile);
      if (!featuredImageUrl) {
        alert('Failed to upload featured image');
        return;
      }
    }
    
    // Create blog
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          featured_image: featuredImageUrl
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Blog created successfully!');
        // Redirect to blog page or reset form
      }
    } catch (error) {
      console.error('Blog creation error:', error);
      alert('Failed to create blog');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Blog Post</h2>
      
      {/* Title */}
      <input
        type="text"
        placeholder="Blog Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      
      {/* Content (Markdown Editor) */}
      <textarea
        placeholder="Write your blog content in Markdown..."
        value={formData.content}
        onChange={(e) => setFormData({...formData, content: e.target.value})}
        rows={15}
        required
      />
      
      {/* Category */}
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="fact_check">Fact Check</option>
        <option value="news">News</option>
        <option value="analysis">Analysis</option>
        <option value="education">Education</option>
      </select>
      
      {/* Featured Image */}
      <div className="featured-image-section">
        <label>Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        
        {/* OR provide URL */}
        <input
          type="url"
          placeholder="Or paste image URL"
          value={formData.featured_image}
          onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
        />
        
        {imagePreview && (
          <img 
            src={imagePreview} 
            alt="Preview" 
            style={{maxWidth: '400px', marginTop: '10px'}}
          />
        )}
      </div>
      
      {/* Video URL */}
      <input
        type="url"
        placeholder="Video URL (YouTube, Vimeo, etc.)"
        value={formData.video_url}
        onChange={(e) => setFormData({...formData, video_url: e.target.value})}
      />
      
      {/* Status */}
      <div className="status-buttons">
        <button 
          type="submit"
          onClick={() => setFormData({...formData, status: 'draft'})}
        >
          Save as Draft
        </button>
        <button 
          type="submit"
          onClick={() => setFormData({...formData, status: 'published'})}
        >
          Publish Now
        </button>
      </div>
    </form>
  );
};

export default BlogCreationForm;
```

### Display Blog with Media

```javascript
const BlogDisplay = ({ blog }) => {
  return (
    <article className="blog-article">
      {/* Featured Image */}
      {blog.featured_image && (
        <div className="featured-image">
          <img 
            src={blog.featured_image} 
            alt={blog.title}
            style={{width: '100%', height: 'auto'}}
          />
        </div>
      )}
      
      {/* Title */}
      <h1>{blog.title}</h1>
      
      {/* Author and Date */}
      <div className="meta">
        <span>By {blog.author_name}</span>
        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
      </div>
      
      {/* Video (if present) */}
      {blog.video_url && (
        <div className="embedded-video">
          {renderVideoEmbed(blog.video_url)}
        </div>
      )}
      
      {/* Content */}
      <div 
        className="blog-content"
        dangerouslySetInnerHTML={{__html: markdownToHtml(blog.content)}}
      />
    </article>
  );
};

// Helper function to render video embeds
const renderVideoEmbed = (url) => {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    return (
      <iframe
        width="100%"
        height="480"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    return (
      <iframe
        src={`https://player.vimeo.com/video/${videoId}`}
        width="100%"
        height="480"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  // Generic video
  return (
    <video controls style={{width: '100%'}}>
      <source src={url} />
      Your browser does not support the video tag.
    </video>
  );
};

const extractYouTubeId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
  return match ? match[1] : null;
};
```

---

## Fact Checker Dashboard

### Pending Claims List with Media

```javascript
import { useState, useEffect } from 'react';

const FactCheckerDashboard = () => {
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingClaims();
  }, []);

  const fetchPendingClaims = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/fact-checker/pending-claims', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPendingClaims(data.claims);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fact-checker-dashboard">
      <h2>Pending Claims for Review</h2>
      
      <div className="claims-list">
        {pendingClaims.map(claim => (
          <div key={claim.id} className="claim-card">
            <h3>{claim.title}</h3>
            <p>{claim.description}</p>
            
            <div className="claim-meta">
              <span>Category: {claim.category}</span>
              <span>Submitted by: {claim.submittedBy}</span>
              <span>Date: {new Date(claim.submittedDate).toLocaleDateString()}</span>
            </div>
            
            {/* Media Preview */}
            {claim.imageUrl && (
              <div className="media-preview">
                <h4>Submitted Image:</h4>
                <img 
                  src={claim.imageUrl} 
                  alt="Claim evidence"
                  style={{maxWidth: '300px', cursor: 'pointer'}}
                  onClick={() => window.open(claim.imageUrl, '_blank')}
                />
              </div>
            )}
            
            {claim.videoUrl && (
              <div className="media-preview">
                <h4>Video Evidence:</h4>
                <a href={claim.videoUrl} target="_blank" rel="noopener noreferrer">
                  View Video 🎥
                </a>
              </div>
            )}
            
            {claim.sourceUrl && (
              <div className="source">
                <strong>Source:</strong>{' '}
                <a href={claim.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {claim.sourceUrl}
                </a>
              </div>
            )}
            
            {/* AI Suggestion */}
            {claim.ai_suggestion && claim.ai_suggestion.verdict && (
              <div className="ai-suggestion">
                <h4>AI Suggestion:</h4>
                <p><strong>Verdict:</strong> {claim.ai_suggestion.verdict}</p>
                <p><strong>Confidence:</strong> {(claim.ai_suggestion.confidence * 100).toFixed(0)}%</p>
                <p>{claim.ai_suggestion.explanation}</p>
              </div>
            )}
            
            <button onClick={() => handleReviewClaim(claim.id)}>
              Review Claim
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FactCheckerDashboard;
```

---

## Image Upload Components

### Reusable Image Upload Component

```javascript
import { useState } from 'react';

const ImageUploader = ({ onUploadComplete, maxSize = 10 * 1024 * 1024 }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    setError(null);
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('evidence', file);
      
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/claims/upload-evidence', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        onUploadComplete(data.fileUrl);
        setFile(null);
        setPreview(null);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="image-uploader">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {preview && (
        <div className="preview-section">
          <img src={preview} alt="Preview" style={{maxWidth: '300px'}} />
          
          <div className="actions">
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={handleRemove} disabled={uploading}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
```

---

## Important Notes

### 1. Media Content Routing
- **Claims with images or videos** are automatically routed to human fact-checkers
- **Text-only claims** are processed by AI first
- Users receive appropriate notifications based on the review type

### 2. Image Handling
- Always validate file size (10MB max) before upload
- Support common image formats: JPG, PNG, GIF, WEBP
- Create preview before upload for better UX
- Handle upload errors gracefully

### 3. Video Handling
- Accept video URLs from YouTube, Vimeo, or direct video files
- Implement proper embed handling for different platforms
- Provide fallback for unsupported video formats

### 4. Security Considerations
- Always include authentication tokens in requests
- Validate file types and sizes on both client and server
- Sanitize URLs before displaying
- Use HTTPS for all API requests

### 5. Error Handling
- Provide clear error messages to users
- Implement retry logic for failed uploads
- Handle network errors gracefully
- Log errors for debugging

---

## Testing Checklist

- [ ] Claim submission without media
- [ ] Claim submission with image URL
- [ ] Claim submission with image upload
- [ ] Claim submission with video URL
- [ ] Claim submission with all media types
- [ ] Image preview before upload
- [ ] File size validation
- [ ] File type validation
- [ ] Error handling for failed uploads
- [ ] Response message display for human review
- [ ] Blog creation with featured image
- [ ] Blog creation with video URL
- [ ] Fact checker can see claim images
- [ ] Fact checker can access claim videos
- [ ] Video embed rendering (YouTube, Vimeo, etc.)

---

## Support

For additional help or questions:
- Review the API documentation: `docs/API_DOCUMENTATION.md`
- Check server logs for error details
- Contact the development team for integration support

---

**Last Updated:** 2024
**Version:** 1.0
