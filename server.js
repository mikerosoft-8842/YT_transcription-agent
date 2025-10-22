const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const { Innertube } = require('youtubei.js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

// Initialize Anthropic (Claude)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Extract video ID from YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get video metadata from YouTube API
async function getVideoMetadata(videoId) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,contentDetails',
          id: videoId,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );
    
    if (response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        thumbnail: video.snippet.thumbnails.high.url
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching metadata:', error.message);
    return null;
  }
}

// Get transcript using youtubei.js
async function getTranscript(videoId) {
  try {
    console.log('Initializing YouTube client...');
    const youtube = await Innertube.create();
    
    console.log('Fetching video info...');
    const info = await youtube.getInfo(videoId);
    
    console.log('Getting transcript...');
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available');
    }
    
    // Convert to format matching old library
    const transcript = transcriptData.transcript.content.body.initial_segments.map(segment => ({
      text: segment.snippet.text,
      offset: segment.start_ms,
      duration: segment.end_ms - segment.start_ms
    }));
    
    console.log('Transcript items fetched:', transcript.length);
    return transcript;
    
  } catch (error) {
    console.error('Transcript fetch error:', error.message);
    throw error;
  }
}

// Summarize transcript using Claude (Anthropic)
async function summarizeTranscript(transcript, summaryType = 'detailed') {
  const fullText = transcript.map(t => t.text).join(' ');
  
  // Debug logging
  console.log('Full text length:', fullText.length);
  console.log('First 200 characters:', fullText.substring(0, 200));
  
  if (fullText.length === 0) {
    throw new Error('Transcript text is empty');
  }
  
  // Truncate if too long (Claude has token limits)
  const maxLength = 100000;
  const textToSummarize = fullText.length > maxLength 
    ? fullText.substring(0, maxLength) + '...' 
    : fullText;
  
  let instruction;
  
  if (summaryType === 'brief') {
    instruction = 'Provide a brief 2-3 sentence summary of this video.';
  } else if (summaryType === 'keypoints') {
    instruction = 'Extract and list the main key points from this video as clear bullet points.';
  } else {
    instruction = 'Provide a detailed summary of this video, including main topics, key insights, and important details.';
  }
  
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `${instruction}\n\nVideo Transcript:\n${textToSummarize}`
        }
      ]
    });
    
    console.log('Claude response received');
    return message.content[0].text;
  } catch (error) {
    console.error('Error with Claude:', error.message);
    console.error('Full error:', error);
    throw new Error('Failed to generate summary with Claude');
  }
}

// API endpoint to process YouTube URL
app.post('/api/process', async (req, res) => {
  try {
    const { url, summaryType } = req.body;
    
    console.log('Processing URL:', url);
    console.log('Summary type:', summaryType);
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }
    
    // Extract video ID
    const videoId = extractVideoId(url);
    console.log('Video ID:', videoId);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Get video metadata
    const metadata = await getVideoMetadata(videoId);
    if (!metadata) {
      return res.status(404).json({ error: 'Video not found or API key invalid' });
    }
    
    console.log('Metadata fetched:', metadata.title);
    
    // Get transcript using new method
    let transcript;
    try {
      transcript = await getTranscript(videoId);
    } catch (error) {
      console.error('Transcript error:', error.message);
      return res.status(404).json({ 
        error: 'No transcript available for this video. The video may not have captions enabled.' 
      });
    }
    
    // Generate summary with Claude
    console.log('Sending to Claude for summarization...');
    const summary = await summarizeTranscript(transcript, summaryType || 'detailed');
    
    console.log('Summary generated successfully');
    
    // Return all data
    res.json({
      videoId,
      metadata,
      transcript,
      summary
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'An error occurred processing the video',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});