# 🎬 YouTube Transcript & Summary Agent

A web application that extracts transcripts from YouTube videos and generates AI-powered summaries using Claude (Anthropic).

## Features

- 📝 **Automatic Transcript Extraction** - Fetches captions from any YouTube video with subtitles
- 🤖 **AI-Powered Summaries** - Uses Claude AI to generate intelligent summaries
- ⚡ **Multiple Summary Types** - Choose from brief, detailed, or key points formats
- 🎨 **Clean Interface** - Modern, responsive design with side-by-side transcript and summary view
- ⏱️ **Timestamped Transcripts** - View full transcripts with precise timestamps

## Demo

Simply paste any YouTube URL and get:
1. Full transcript with timestamps
2. AI-generated summary based on your preference
3. Video metadata (title, channel, duration)

## Prerequisites

- Node.js (v14 or higher)
- YouTube Data API key
- Anthropic API key

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/mikerosoft-8842/YT_transcription-agent.git
cd YT_transcription-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```
YOUTUBE_API_KEY=your_youtube_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Getting API Keys

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API Key)

### Anthropic API
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up and add credits to your account
3. Create an API key

## Usage

1. **Start the backend server**
```bash
npm start
```

The server will run on `http://localhost:3001`

2. **Open the frontend**

Simply open `index.html` in your web browser, or:
```bash
open index.html
```

3. **Process a video**
- Paste any YouTube URL
- Select your preferred summary type (Brief, Detailed, or Key Points)
- Click "Process Video"
- View the transcript and AI summary!

## Project Structure

```
YT_transcription-agent/
├── server.js           # Express backend server
├── index.html          # Frontend interface
├── package.json        # Dependencies
├── .env               # API keys (not tracked)
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Technologies Used

- **Backend**: Node.js, Express
- **AI**: Anthropic Claude (Sonnet 4)
- **APIs**: YouTube Data API v3, YouTubeI.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Dependencies

- `express` - Web server framework
- `@anthropic-ai/sdk` - Claude AI integration
- `youtubei.js` - YouTube transcript extraction
- `axios` - HTTP client
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

## Notes

- Videos must have captions/subtitles enabled
- API usage may incur costs (YouTube API is free with quotas, Anthropic charges per token)
- Keep your `.env` file secure and never commit it to version control

## Future Enhancements

- [ ] Download transcript as text file
- [ ] Copy summary to clipboard
- [ ] Support for multiple languages
- [ ] Playlist processing
- [ ] Search within transcripts
- [ ] Export summaries as PDF

## License

MIT License - Feel free to use and modify for your projects!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using Claude AI and YouTube Data API