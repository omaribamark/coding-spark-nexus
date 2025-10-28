# AI Integration Documentation
## Hakikisha AI Assistant Implementation Guide

This document provides a comprehensive guide to implementing the Hakikisha AI Assistant powered by Poe API.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Setup](#backend-setup)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Security & Best Practices](#security--best-practices)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Hakikisha AI Assistant provides:
- **Real-time chat interface** with AI-powered responses
- **Image upload support** for visual analysis
- **Document upload support** (PDF, text files)
- **Instant AI fact-checking** for submitted claims
- **Context-aware responses** about elections and claims

### Architecture
```
Frontend (React Native) 
    ↓
Backend API (Your Server)
    ↓
Poe API (Election_Assistant model)
```

---

## 🔧 Backend Setup

### Prerequisites
- Node.js or Python backend server
- Poe API key: `ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA`
- OpenAI SDK installed

### Installation

#### Node.js/Express
```bash
npm install openai express cors multer
```

#### Python/Flask
```bash
pip install openai flask flask-cors
```

---

## 📡 API Endpoints

You need to implement these endpoints in your backend:

### 1. **POST /api/v1/ai/chat**
Main chat endpoint for AI conversations.

**Request Body:**
```json
{
  "prompt": "What is the deadline for voter registration?",
  "hasAttachments": false,
  "attachmentTypes": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "The voter registration deadline is...",
  "model": "Election_Assistant"
}
```

**Implementation (Node.js):**
```javascript
const express = require('express');
const { OpenAI } = require('openai');

const router = express.Router();

const openai = new OpenAI({
  apiKey: "ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA",
  baseURL: "https://api.poe.com/v1",
});

router.post('/chat', async (req, res) => {
  try {
    const { prompt, hasAttachments, attachmentTypes } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Add context about attachments if present
    let enhancedPrompt = prompt;
    if (hasAttachments) {
      const types = attachmentTypes.join(', ');
      enhancedPrompt = `[User attached ${types}]\n\n${prompt}`;
    }

    const response = await openai.chat.completions.create({
      model: "Election_Assistant",
      messages: [
        {
          role: "system",
          content: "You are Hakikisha AI, an election fact-checking assistant for Kenya. Provide accurate, helpful information about elections, voting, and claims. Always be professional and unbiased."
        },
        {
          role: "user",
          content: enhancedPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const responseText = response.choices[0].message.content;

    // Add disclaimer to response
    const disclaimer = "\n\n⚠️ This response is AI-generated. CRECO is not responsible for any implications. Please verify important information.";

    res.json({
      success: true,
      response: responseText + disclaimer,
      model: "Election_Assistant",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI response',
      details: error.message
    });
  }
});

module.exports = router;
```

**Implementation (Python/Flask):**
```python
from flask import Blueprint, request, jsonify
from openai import OpenAI
from datetime import datetime

ai_bp = Blueprint('ai', __name__)

openai_client = OpenAI(
    api_key="ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA",
    base_url="https://api.poe.com/v1"
)

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()
        has_attachments = data.get('hasAttachments', False)
        attachment_types = data.get('attachmentTypes', [])

        if not prompt:
            return jsonify({
                'success': False,
                'error': 'Prompt is required'
            }), 400

        # Enhance prompt with attachment context
        enhanced_prompt = prompt
        if has_attachments:
            types = ', '.join(attachment_types)
            enhanced_prompt = f"[User attached {types}]\n\n{prompt}"

        response = openai_client.chat.completions.create(
            model="Election_Assistant",
            messages=[
                {
                    "role": "system",
                    "content": "You are Hakikisha AI, an election fact-checking assistant for Kenya. Provide accurate, helpful information about elections, voting, and claims. Always be professional and unbiased."
                },
                {
                    "role": "user",
                    "content": enhanced_prompt
                }
            ],
            temperature=0.7,
            max_tokens=800
        )

        response_text = response.choices[0].message.content
        disclaimer = "\n\n⚠️ This response is AI-generated. CRECO is not responsible for any implications. Please verify important information."

        return jsonify({
            'success': True,
            'response': response_text + disclaimer,
            'model': 'Election_Assistant',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        print(f"AI chat error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate AI response',
            'details': str(e)
        }), 500
```

---

### 2. **POST /api/v1/ai/fact-check**
AI fact-checking for submitted claims (called when users submit claims).

**Request Body:**
```json
{
  "claimText": "The election will be held on January 15th",
  "category": "governance",
  "sourceLink": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "aiVerdict": {
    "verdict": "needs_context",
    "explanation": "While an election date has been mentioned...",
    "confidence": "medium",
    "suggestedSources": [
      {
        "title": "IEBC Official Calendar",
        "url": "https://iebc.or.ke"
      }
    ]
  },
  "disclaimer": "This is an AI-generated preliminary verdict. Human fact-checkers will review this claim."
}
```

**Implementation (Node.js):**
```javascript
router.post('/fact-check', async (req, res) => {
  try {
    const { claimText, category, sourceLink } = req.body;

    if (!claimText) {
      return res.status(400).json({
        success: false,
        error: 'Claim text is required'
      });
    }

    const factCheckPrompt = `
Analyze this claim and provide a fact-check verdict:

Claim: "${claimText}"
Category: ${category || 'general'}
Source: ${sourceLink || 'Not provided'}

Provide:
1. Verdict (true/false/misleading/needs_context)
2. Detailed explanation
3. Confidence level (high/medium/low)
4. Suggested reliable sources to verify this claim

Format your response clearly and professionally.
`;

    const response = await openai.chat.completions.create({
      model: "Election_Assistant",
      messages: [
        {
          role: "system",
          content: "You are a professional fact-checker. Analyze claims objectively and provide evidence-based verdicts."
        },
        {
          role: "user",
          content: factCheckPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const responseText = response.choices[0].message.content;

    res.json({
      success: true,
      aiVerdict: {
        verdict: extractVerdict(responseText), // Helper function
        explanation: responseText,
        confidence: "medium",
        timestamp: new Date().toISOString()
      },
      disclaimer: "This is an AI-generated preliminary verdict. Human fact-checkers will review this claim."
    });

  } catch (error) {
    console.error('Fact-check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate fact-check',
      details: error.message
    });
  }
});

// Helper function to extract verdict from AI response
function extractVerdict(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('verdict: true') || lowerText.includes('this claim is true')) {
    return 'verified';
  } else if (lowerText.includes('verdict: false') || lowerText.includes('this claim is false')) {
    return 'false';
  } else if (lowerText.includes('misleading')) {
    return 'misleading';
  } else {
    return 'needs_context';
  }
}
```

---

### 3. **POST /api/v1/ai/analyze-image** (Optional)
For analyzing uploaded images.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "analysis": "This image shows...",
  "timestamp": "2025-01-24T10:30:00Z"
}
```

---

## 🎨 Frontend Integration

### Update Claim Submission to Include AI Check

**File: `src/screens/SubmitClaimScreen.tsx`**

Add AI fact-checking on claim submission:

```typescript
const handleSubmit = async () => {
  if (!claimText.trim()) {
    Alert.alert('Validation Error', 'Please enter the claim text');
    return;
  }

  setIsSubmitting(true);
  
  try {
    // First, get AI verdict
    const aiResponse = await api.post('/ai/fact-check', {
      claimText: claimText,
      category: 'general',
      sourceLink: sourceLink,
    });

    // Then submit claim with AI verdict
    await claimsService.submitClaim({
      category: 'general',
      claimText: claimText,
      videoLink: videoLink,
      sourceLink: sourceLink,
      imageUrl: imageUri || undefined,
      aiVerdict: aiResponse.data.aiVerdict,
    });
    
    setIsSubmitting(false);
    
    // Show AI verdict to user
    Alert.alert(
      'Claim Submitted',
      `Your claim has been submitted!\n\nAI Preliminary Verdict: ${aiResponse.data.aiVerdict.verdict}\n\n${aiResponse.data.disclaimer}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset and navigate
            setClaimText('');
            setVideoLink('');
            setSourceLink('');
            setImageUri(null);
            navigation.navigate('Home', { refresh: true });
          },
        },
      ],
    );
    
  } catch (error: any) {
    setIsSubmitting(false);
    console.error('Submit claim error:', error);
    Alert.alert('Submission Failed', error.message || 'Failed to submit claim');
  }
};
```

---

## 🔒 Security & Best Practices

### 1. **API Key Security**
- ✅ **NEVER** expose the API key in frontend code
- ✅ Store API key in environment variables
- ✅ Use backend proxy for all AI requests

**Environment Setup:**
```bash
# .env file
POE_API_KEY=ZceEiyLZg4JbvhV8UDpnY0rMT037Pi4QIhdPy4pirRA
POE_BASE_URL=https://api.poe.com/v1
AI_MODEL=Election_Assistant
```

### 2. **Rate Limiting**
Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many AI requests, please try again later.'
});

app.use('/api/v1/ai', aiLimiter);
```

### 3. **Input Validation**
Always validate and sanitize user inputs:

```javascript
const sanitizeInput = (text) => {
  return text
    .trim()
    .substring(0, 5000) // Max length
    .replace(/[<>]/g, ''); // Remove potential HTML
};
```

### 4. **Error Handling**
Implement comprehensive error handling:

```javascript
try {
  // AI request
} catch (error) {
  if (error.response?.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.'
    });
  } else if (error.response?.status === 401) {
    console.error('Invalid API key');
    return res.status(500).json({
      success: false,
      error: 'AI service configuration error'
    });
  } else {
    return res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable'
    });
  }
}
```

---

## 🧪 Testing

### Test the Chat Endpoint

**Using cURL:**
```bash
curl -X POST http://your-backend-url/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is voter registration?",
    "hasAttachments": false,
    "attachmentTypes": []
  }'
```

**Using Postman:**
1. Method: POST
2. URL: `http://your-backend-url/api/v1/ai/chat`
3. Body (JSON):
```json
{
  "prompt": "Explain the election process in Kenya",
  "hasAttachments": false
}
```

### Test Fact-Checking

```bash
curl -X POST http://your-backend-url/api/v1/ai/fact-check \
  -H "Content-Type: application/json" \
  -d '{
    "claimText": "Elections will be held next month",
    "category": "governance"
  }'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **401 Unauthorized Error**
```
Error: Request failed with status code 401
```
**Solution:** Verify your API key is correct and properly set in environment variables.

#### 2. **Timeout Errors**
```
Error: timeout of 30000ms exceeded
```
**Solution:** Increase timeout or check your internet connection:
```javascript
const response = await openai.chat.completions.create({
  // ... other options
}, { timeout: 60000 }); // 60 second timeout
```

#### 3. **Empty Responses**
**Solution:** Check if the model name is correct: `Election_Assistant`

#### 4. **CORS Errors in Frontend**
**Solution:** Enable CORS in your backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:*', // or your frontend URL
  credentials: true
}));
```

---

## 📊 API Response Time Guidelines

- Chat responses: ~2-5 seconds
- Fact-checking: ~3-7 seconds
- If response takes >10 seconds, show loading state

---

## 🔄 Update Process

### When Frontend Updates Are Deployed

1. Ensure backend endpoint URLs are correct in `src/config/api.config.ts`
2. Test AI chat functionality
3. Test claim submission with AI fact-checking
4. Verify disclaimers are displayed

### Backend Deployment Checklist

- [ ] Environment variables set correctly
- [ ] API key is valid and not exposed
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health check endpoint working

---

## 📞 Support

For issues with:
- **Poe API**: Contact Poe support
- **Integration**: Check this documentation
- **Backend setup**: Refer to your backend framework docs

---

## 🎓 Best Practices Summary

1. ✅ Always use backend proxy for AI requests
2. ✅ Display AI disclaimer on all AI responses
3. ✅ Implement rate limiting
4. ✅ Validate and sanitize all inputs
5. ✅ Handle errors gracefully
6. ✅ Show loading states during AI processing
7. ✅ Log errors for debugging
8. ✅ Never expose API keys in frontend
9. ✅ Test thoroughly before production
10. ✅ Monitor API usage and costs

---

**Last Updated:** January 24, 2025
**Version:** 1.0.0
