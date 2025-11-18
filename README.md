# OmniPost - AI Social Media Content Studio

OmniPost is a powerful React application that transforms a single idea or long-form article into optimized content for multiple social media platforms simultaneously. 

It leverages Google's **Gemini 2.5 Flash** model for intelligent text generation and reasoning, and **Imagen 4.0** for creating high-quality, context-aware visual assets.

## ✨ Key Features

- **Multi-Platform Generation**: Instantly creates tailored posts for:
  - **LinkedIn**: Professional, structured, long-form content.
  - **Twitter / X**: Short, punchy, engaging tweets under 280 characters.
  - **Instagram**: Visual-focused captions with trending, relevant hashtags.

- **AI Image Generation**: automatically generates unique images for each platform using **Imagen 4.0**. 
  - Includes customizable aspect ratios (1:1, 16:9, 9:16, etc.) per platform.

- **Smart Summarization**: Paste full articles or long text blobs, and OmniPost will summarize them into a concise concept ready for social media generation.

- **Tone Customization**:
  - Presets: Professional, Witty, Urgent.
  - **Custom Tone**: Define your own persona (e.g., "Sarcastic", "Empathetic", "Pirate").

- **Content Scheduling**: Built-in scheduler UI to plan when your drafts should go live.

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI SDK**: Google GenAI SDK (`@google/genai`)
  - **Text Model**: `gemini-2.5-flash`
  - **Image Model**: `imagen-4.0-generate-001`

## 🚀 Usage

1. **Input your concept**: Type a raw idea or paste a long article into the main text area.
2. **Summarize (Optional)**: If you pasted a long article, click the "Summarize" button to condense it into a social-ready core concept.
3. **Select Settings**: 
   - Choose a **Tone** (or type a custom one).
   - Open **Settings** to adjust image aspect ratios for specific platforms.
4. **Generate**: Click the "Generate" button. The app will draft text and generate images in parallel.
5. **Review & Export**:
   - Click the **Copy** icon to copy text to clipboard.
   - Click the **Download** icon on images to save them.
   - Click the **Calendar** icon to set a publish date.

## 🔑 Configuration

This application requires a valid Google API Key with access to Gemini and Imagen models. 

The key is automatically injected via `process.env.API_KEY` in the environment.

## 📦 Models Used

- **Text & Logic**: `gemini-2.5-flash` - Selected for speed and high reasoning capability for formatting distinct social styles.
- **Image Generation**: `imagen-4.0-generate-001` - Used for high-fidelity image creation based on prompts derived from the text content.