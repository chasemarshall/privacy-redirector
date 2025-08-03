# 🔒 Privacy Redirector

A Firefox extension that automatically redirects YouTube to Piped and Reddit to custom privacy-friendly instances, while completely blocking data transmission to Google/YouTube servers.

## ✨ Features

- 🚫 **Complete YouTube blocking** - Zero data sent to Google/YouTube servers
- 🔄 **Smart redirection** - YouTube → Piped, Reddit → Custom instances
- ⚙️ **Fully customizable** - Set your preferred Piped and Reddit instances
- 🗑️ **History cleanup** - Automatically removes original URLs from browser history
- 🌐 **Universal support** - Works with all YouTube and Reddit URL formats
- ⚡ **Lightning fast** - Blocks requests before any connection is made

## 🚀 Quick Installation

### For Firefox Users

1. **Download the latest release:**
   - Go to [Releases](https://github.com/chasemarshall/privacy-redirector/releases/latest)
   - Download `privacy-redirector.zip`

2. **Install the extension:**
   - Extract the ZIP file to a folder
   - Open Firefox and go to `about:debugging`
   - Click "This Firefox" in the sidebar
   - Click "Load Temporary Add-on..."
   - Navigate to the extracted folder and select `manifest.json`

3. **You're done!** Try visiting any YouTube URL - it will redirect to Piped instantly.

## ⚙️ Configuration

### Access Settings
- **Method 1:** Go to `about:addons` → Find "Privacy Redirector" → Click "..." → "Preferences"
- **Method 2:** Right-click the extension icon → "Options" (if visible in toolbar)

### Customize URLs
- **Piped Instance:** Default is `piped.withmilo.xyz` - change to any Piped instance
- **Reddit Instance:** Default is `reddit.withmilo.xyz` - change to any Reddit alternative

### Popular Instances

**Piped (YouTube):**
- `https://piped.withmilo.xyz` (default)
- `https://piped.kavin.rocks`
- `https://piped.tokhmi.xyz`
- `https://piped.moomoo.me`

**Reddit Alternatives:**
- `https://reddit.withmilo.xyz` (default)
- `https://redlib.matthew.science`
- `https://redlib.privacydev.net`
- `https://r.nf`

## 📋 Supported URL Formats

### YouTube → Piped
| Original URL | Redirects to |
|-------------|--------------|
| `youtube.com/watch?v=dQw4w9WgXcQ` | `piped.withmilo.xyz/watch?v=dQw4w9WgXcQ` |
| `youtu.be/dQw4w9WgXcQ` | `piped.withmilo.xyz/watch?v=dQw4w9WgXcQ` |
| `youtube.com/playlist?list=...` | `piped.withmilo.xyz/playlist?list=...` |
| `youtube.com/channel/UC...` | `piped.withmilo.xyz/channel/UC...` |
| `m.youtube.com/watch?v=...` | `piped.withmilo.xyz/watch?v=...` |

### Reddit → Custom Instance
| Original URL | Redirects to |
|-------------|--------------|
| `reddit.com/r/firefox` | `reddit.withmilo.xyz/r/firefox` |
| `old.reddit.com/r/privacy` | `reddit.withmilo.xyz/r/privacy` |
| `www.reddit.com/user/...` | `reddit.withmilo.xyz/user/...` |

## 🔒 Privacy & Security

### What gets blocked:
- ✅ All requests to `youtube.com`, `googlevideo.com`, `ytimg.com`
- ✅ YouTube thumbnails, scripts, tracking pixels
- ✅ Google Analytics and advertising requests
- ✅ Original URLs removed from browser history

### What you get:
- ✅ **Zero data leakage** to Google/YouTube
- ✅ **Complete privacy** - no tracking, no ads
- ✅ **Full functionality** via Piped
- ✅ **Custom instances** for maximum control

## 🛠️ Development

### Prerequisites
- Firefox Developer Edition (recommended)
- Basic knowledge of WebExtensions API

### Setup
```bash
git clone https://github.com/chasemarshall/privacy-redirector.git
cd privacy-redirector
```

### Testing
1. Make changes to the code
2. Go to `about:debugging` in Firefox
3. Click "Reload" next to the extension
4. Test with various YouTube/Reddit URLs

### File Structure
```
privacy-redirector/
├── manifest.json          # Extension configuration
├── background.js          # Main extension logic (Firefox WebExtensions API)
├── options.html           # Settings page UI
├── options.js            # Settings page functionality
└── README.md             # This file
```

## 🧪 Verify It's Working

### Quick Test
1. Open Firefox Developer Tools (F12)
2. Go to "Network" tab
3. Visit `https://youtube.com/watch?v=dQw4w9WgXcQ`
4. You should see **zero requests** to YouTube domains
5. Only requests to your chosen Piped instance

### Extension Console
1. Go to `about:debugging`
2. Click "Inspect" next to Privacy Redirector
3. Visit a YouTube URL
4. Should see: `"Blocking and redirecting: youtube.com/... -> piped.withmilo.xyz/..."`

## ❓ Troubleshooting

**Extension not redirecting:**
- Check it's enabled in `about:addons`
- Verify you're using supported URL formats
- Check browser console for error messages

**Settings page not opening:**
- Go to `about:addons` → Privacy Redirector → Preferences
- Try reloading the extension in `about:debugging`

**Still seeing YouTube requests:**
- Clear browser cache and reload extension
- Check Network tab in Developer Tools
- Ensure you're testing with main frame requests (not background)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit: `git commit -m "Add feature"`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Piped](https://github.com/TeamPiped/Piped) - Privacy-friendly YouTube frontend
- [Redlib](https://github.com/redlib-org/redlib) - Privacy-friendly Reddit frontend
- Mozilla WebExtensions documentation
- The privacy community for inspiration

---

**⭐ If this extension helps protect your privacy, consider starring the repository!**
