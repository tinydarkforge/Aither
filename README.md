# Aither

**Copyright © 2025 Your Company. All rights reserved.**

A static QR code generator and manager for video content. Perfect for exhibits, advertising campaigns, events, digital signage, and more. Built with a modern SaaS theme featuring light/dark mode switcher, Aither runs entirely client-side with no backend required.

## Features

### Core Functionality
- **Pure Static App**: Runs 100% in the browser with no server needed
- **QR Code Generation**: Create beautiful QR codes for video URLs with customization options
- **Smart Video Player**: MP4 URLs automatically use a custom video player when scanned
- **Client-Side Storage**: Saves all QR codes locally using IndexedDB
- **Export Options**: Download QR codes as PNG or SVG
- **Local Data Persistence**: QR codes and settings stored locally in IndexedDB (videos still require internet)

### Multi-Tenant Organization System
- **Organization Management**: Superadmin can create and manage multiple organizations
- **Organization Isolation**: Each organization has separate data and authentication
- **Per-Organization Login**: Each organization has its own credentials and QR code library
- **Password Management**: Superadmin can reset organization passwords

### Bulk Collection Generation
- **Directory URL Parsing**: Paste a directory listing URL to extract all video links
- **Automatic Collection Creation**: Generates QR codes for all videos in a directory at once
- **Smart Filtering**: Automatically filters for MP4 files
- **Collection Organization**: Group related videos together for easy management

### Modern UI/UX
- **Theme Switcher**: Toggle between light and dark mode with user preference persistence
- **Modern SaaS Design**: Clean, professional interface
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Efficient navigation for power users

### Security & Authentication
- **Secure Login**: Client-side password authentication with SHA-256 hashing
- **Superadmin Panel**: Dedicated admin interface for organization management
- **Password Reset Utility**: Built-in tool for superadmin password recovery
- **Code Protection**: Obfuscated and minified production builds

## Tech Stack

- **Build Tool**: Vite 5.0
- **Storage**: IndexedDB via Dexie.js
- **QR Generation**: qr-code-styling
- **QR Scanning**: html5-qrcode (in-player scanner)
- **Authentication**: Client-side SHA-256 hashed passwords
- **Code Protection**: javascript-obfuscator with terser minification
- **Languages**: Vanilla HTML, CSS, JavaScript (no frameworks)

## Quick Start

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aither
```

2. Install dependencies:
```bash
npm install
```

3. Set up your superadmin password:
```bash
# Generate a password hash
npm run hash-password

# Create .env file from example
cp .env.example .env

# Edit .env and replace the hash with your generated hash
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3010/login.html`

## Building for Production

```bash
npm run build
```

The static files will be output to the `dist/` directory. Production builds include:
- Code obfuscation for IP protection
- Terser minification for smaller bundle size
- Optimized assets for faster loading

You can deploy these to any static hosting service.

### Deploying to Vercel

1. **Connect your repository** to Vercel
2. **Set environment variable:**
   - Go to Project Settings → Environment Variables
   - Add new variable:
     - **Key:** `VITE_ADMIN_PASS_HASH`
     - **Value:** (your password hash from `.env`)
     - **Environments:** Check Production, Preview, and Development
3. **Deploy settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Redeploy** after adding the environment variable

**Important:** Vite requires environment variables at build time, so you must redeploy after adding them.

### Other Deployment Options

- **Netlify**: Drag and drop the `dist` folder, or connect repo and set env vars in Build & Deploy settings
- **GitHub Pages**: Push the `dist` folder to a `gh-pages` branch
- **Any web server**: Copy `dist` contents to your web root

## Security Model

### Important Security Notes

**This is NOT enterprise-grade security.** The authentication system is designed for internal use where:

- The app is accessed by trusted staff only
- Physical security is assumed
- The risk of credential compromise is low

For detailed security information, see [SECURITY.md](SECURITY.md).

### How Authentication Works

1. **Password Hashing**: Passwords are hashed using SHA-256
2. **Hash Storage**: Superadmin hash is embedded during build; organization hashes are stored in IndexedDB
3. **Client-Side Validation**: Entered password is hashed and compared to stored hash
4. **Session Management**: Session tokens stored in localStorage with 24-hour expiration

### Limitations

- **Client-Side Only**: Anyone with browser dev tools can bypass authentication
- **No Salt**: Passwords hashed without salts (vulnerable to rainbow tables)
- **Local Storage**: Session tokens stored in plain localStorage
- **No Rate Limiting**: No protection against brute force attempts

See [SECURITY.md](SECURITY.md) for comprehensive security documentation and best practices.

### When This Approach is Appropriate

- Internal tools for trusted users
- Low-stakes applications
- Offline-first requirements
- When you want to avoid backend infrastructure

### When to Use Something Else

If you need real security, consider:

- **Firebase Auth**: Free OAuth provider, easy to integrate
- **Auth0**: Comprehensive authentication service
- **Backend API**: Build a proper server with session management

## Generating Password Hashes

To create or update your superadmin password:

```bash
npm run hash-password
```

Enter your desired password when prompted. The script will output:
- The SHA-256 hash
- Instructions to add it to your `.env` file

Example:
```
Enter password to hash: MySecurePassword123

Your password hash:
a1b2c3d4e5f6...

Add this to your .env file:
VITE_ADMIN_PASS_HASH=a1b2c3d4e5f6...
```

## Project Structure

```
aither/
├── index.html              # Main app page (QR generator)
├── login.html              # Login page
├── player.html             # Video player page (for QR scans)
├── admin.html              # Superadmin panel
├── reset-admin.html        # Superadmin password reset utility
├── package.json
├── vite.config.js
├── .env.example
├── LICENSE                 # Proprietary license
├── TERMS.md                # Terms of Service
├── SECURITY.md             # Security policy and documentation
├── scripts/
│   └── hash-password.js    # Password hashing utility
└── src/
    ├── js/
    │   ├── auth.js         # Authentication logic
    │   ├── db.js           # IndexedDB wrapper (Dexie)
    │   ├── qr.js           # QR generation
    │   ├── ui.js           # UI interactions
    │   ├── theme.js        # Theme switcher (light/dark)
    │   └── parser.js       # Directory URL parser
    ├── styles/
    │   ├── vars.css        # CSS variables (theme)
    │   ├── layout.css      # Layout styles
    │   ├── components.css  # Component styles
    │   └── player.css      # Video player styles
    └── assets/
        ├── logo.svg        # App logo
        └── favicon.svg     # Custom favicon with QR code
```

## Usage

### Superadmin: Managing Organizations

1. Navigate to `/admin.html`
2. Enter your superadmin password
3. Create new organizations with unique credentials
4. View all organizations and their login links
5. Reset organization passwords as needed

**Password Reset Utility:**
If you forget your superadmin password, use the reset utility at `/reset-admin.html` to set a new password.

### Organization Admin: Logging In

1. Navigate to the app URL or use the organization-specific login link
2. Enter your organization password
3. Click "Login"

### Generating Individual QR Codes

1. Go to the "Generate" tab
2. Enter the video URL
3. Customize size, colors, and margins (optional)
4. Upload a logo (optional)
5. Preview the QR code
6. Click "Generate QR" to save

### Generating Bulk Collections

1. Go to the "Collections" tab
2. Enter a directory listing URL (e.g., `https://example.com/videos/`)
3. Click "Parse Directory"
4. Review the extracted video URLs
5. Enter a collection name
6. Click "Generate Collection"
7. All QR codes are created and saved automatically

**Directory URL Requirements:**
- Must be a publicly accessible webpage
- Should contain links to MP4 files
- Works best with Apache-style directory listings

### Managing QR Codes

1. Go to the "List" tab
2. View all saved QR codes
3. **Search**: Use the search box to filter QR codes by URL, title, or description
4. Filter by collection (if applicable)
5. Click on any QR to view full-size
6. **Edit**: Click edit to modify QR code title and description
7. Download as PNG or SVG
8. Copy URL or delete as needed

### Bulk URL Input

In addition to directory parsing, you can manually enter multiple video URLs:

1. Go to the "Collections" tab
2. Switch to "Bulk URLs" mode
3. Enter one video URL per line
4. Enter a collection name
5. Click "Generate Collection"

### Rescan Collections

Update existing collections with new videos:

1. Go to the "Collections" tab
2. Find the collection you want to update
3. Click "Rescan" to check the source directory for new videos
4. New QR codes are automatically added to the collection

### Backup & Export

Export your data for backup or migration:

1. **Organization Export**: Export all QR codes for your organization as JSON
2. **Import Data**: Restore from a previously exported JSON backup
3. **Superadmin Export**: Export all organizations and their data (superadmin only)

*Note: Access backup features through the admin panel settings.*

### Video Player Feature

When you enter an MP4 URL, Aither automatically creates a QR code that links to a custom video player instead of the raw MP4 file. This provides a better user experience:

**How it works:**
1. Enter an MP4 URL (e.g., `https://example.com/video.mp4`)
2. Optionally add a title and description for the video
3. The QR code will link to: `https://yoursite.com/player.html?video=<encoded-url>&title=<title>&description=<description>`
4. When scanned, visitors see a beautiful video player with:
   - Play/pause controls
   - Fullscreen support (double-click video)
   - Mobile-optimized layout
   - Adaptive theme (light/dark based on user preference)
   - **Built-in QR scanner** for watching multiple videos

**Benefits:**
- Videos play directly in the browser (no download required)
- Consistent viewing experience across devices
- Professional presentation for your audience
- Works perfectly on mobile devices after QR scanning
- **No login required** - The player page is completely public and accessible to anyone

The original MP4 URL is saved for your reference in the library.

**Note:** Only the admin app (Generate/List/Collections tabs) requires login. The video player page is public so visitors can watch videos without authentication.

### Mobile Video Experience

The video player provides a **native-like mobile experience** optimized for on-the-go viewing:

**Auto-Fullscreen on Mobile:**
- When a visitor scans a QR code on their mobile device, they see a "Start Video" button
- Tapping this button automatically enters fullscreen mode and begins video playback
- This provides an immersive, distraction-free viewing experience

**Forced Landscape Orientation:**
- Mobile devices are locked to landscape (horizontal) orientation
- Users must rotate their phone horizontally to view the video
- If held vertically, a "Please rotate your device" prompt appears with a rotating phone icon
- This ensures optimal video viewing on mobile screens

**Device-Specific Implementations:**
- **iOS (iPhone/iPad)**: Uses CSS-based fullscreen to preserve HTML overlay controls
- **Android**: Uses native Fullscreen API with Screen Orientation lock
- **Desktop**: Standard fullscreen support via double-click

**Always-Visible QR Scan Button:**
- The QR scan button remains visible even in fullscreen mode
- Positioned in the top-left corner as a compact icon button
- Works seamlessly on iOS (where native fullscreen removes HTML overlays)
- Ultra-high z-index ensures it's always accessible

**Mobile-Optimized Meta Tags:**
- Viewport settings prevent zooming for an app-like feel
- iOS web app capabilities for immersive fullscreen
- Translucent status bar on iOS for edge-to-edge display
- Playsinline attributes for smooth mobile video playback

This mobile experience makes Aither perfect for exhibits, events, advertising campaigns, and any scenario where users scan QR codes with their phones and expect a polished, native-app-quality video viewing experience.

### Scanning Multiple Videos

Users can watch multiple videos without leaving the player:

1. Watch the first video after scanning a QR code
2. Click the **"Scan Another QR"** button in the player
3. Camera opens with QR scanner
4. Scan a new QR code for another video
5. New video loads automatically and starts playing

This feature is perfect for exhibits, product showcases, event programs, or any scenario where viewers want to explore multiple videos without repeatedly opening their camera app.

### Theme Switcher

Toggle between light and dark mode:
- Click the theme toggle button in the navigation bar
- Your preference is saved automatically
- Theme persists across sessions
- Also applies to the video player for a consistent experience

## Customization

### Theme Colors

Edit `/src/styles/vars.css` to customize the color scheme:

```css
/* Light theme */
body {
  --bg: #f5f5f5;
  --panel: #ffffff;
  --accent: #0ea5b7;
  --text: #1a1a1a;
  --text-muted: #666666;
}

/* Dark theme */
body.dark-theme {
  --bg: #0b2a37;
  --panel: #0f3b56;
  --accent: #0ea5b7;
  --text: #e6f7f8;
  --text-muted: #9fb8c0;
}
```

### QR Code Defaults

Edit `/src/js/qr.js` to change default QR code settings.

## Troubleshooting

### Login not working
- Check that your `.env` file has the correct `VITE_ADMIN_PASS_HASH`
- Restart the dev server after changing `.env`
- Clear browser localStorage and try again
- For organization login, ensure you're using the correct organization credentials

### QR codes not saving
- Check browser console for IndexedDB errors
- Ensure you're not in private/incognito mode
- Check that localStorage is enabled
- Try clearing browser data and logging in again

### Collection parsing not working
- Ensure the directory URL is publicly accessible
- Check that the page contains links to MP4 files
- Some websites may block CORS requests (use a CORS proxy if needed)
- Check browser console for detailed error messages

### Theme not persisting
- Check that localStorage is enabled
- Clear browser cache and try again
- Ensure JavaScript is enabled in your browser

### Build fails
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 16 or higher
- Check for syntax errors in `.env`
- Verify all dependencies are properly installed

## Legal & Documentation

This project is proprietary software. Please review the following documentation:

- **[LICENSE](LICENSE)** - Proprietary license and usage restrictions
- **[TERMS.md](TERMS.md)** - Terms of Service for users
- **[SECURITY.md](SECURITY.md)** - Security policy, limitations, and best practices

**Important Legal Notes:**
- This software is NOT open source
- All rights reserved
- Redistribution, modification, or commercial use is prohibited without written permission
- See LICENSE file for full terms

## Contributing

This is a proprietary internal tool. External contributions are not accepted at this time.

For authorized team members:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request for review

## Support

For questions, issues, or security concerns:

**Support:**
- Email: contact@example.com
- Security: security@example.com

**Security Issues:**
- See [SECURITY.md](SECURITY.md) for responsible disclosure policy
- Email security@example.com for sensitive vulnerabilities
- Do not publicly disclose security issues

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

**© 2025 Your Company. All rights reserved.**

Built with care and attention to detail.
