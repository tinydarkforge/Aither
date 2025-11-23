# Aither

A static QR code generator and manager for ASL (American Sign Language) museum videos. Built with a JW.org-inspired dark theme, Aither runs entirely client-side with no backend required.

## Features

- **Pure Static App**: Runs 100% in the browser with no server needed
- **QR Code Generation**: Create beautiful QR codes for video URLs with customization options
- **Smart Video Player**: MP4 URLs automatically use a custom video player when scanned
- **Client-Side Storage**: Saves all QR codes locally using IndexedDB
- **Secure Login**: Client-side password authentication with SHA-256 hashing
- **Dark Theme**: Clean, spiritual aesthetic inspired by JW.org
- **Offline Capable**: Works without an internet connection once loaded
- **Export Options**: Download QR codes as PNG or SVG

## Tech Stack

- **Build Tool**: Vite
- **Storage**: IndexedDB via Dexie.js
- **QR Generation**: qr-code-styling
- **Authentication**: Client-side SHA-256 hashed passwords
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

3. Set up your admin password:
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

5. Open your browser to `http://localhost:3000/login.html`

## Building for Production

```bash
npm run build
```

The static files will be output to the `dist/` directory. You can deploy these to any static hosting service.

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

**This is NOT enterprise-grade security.** The authentication system is designed for internal museum use where:

- The app is accessed by trusted staff only
- Physical security is assumed
- The risk of credential compromise is low

### How Authentication Works

1. **Password Hashing**: Your admin password is hashed using SHA-256 during setup
2. **Hash Storage**: The hash is stored in the app's environment variables (embedded during build)
3. **Client-Side Validation**: When logging in, the entered password is hashed and compared to the stored hash
4. **Session Management**: On successful login, a session token is stored in localStorage with a 24-hour expiration

### Limitations

- **No Server Validation**: Anyone with browser dev tools can bypass the login
- **Hash Visibility**: The password hash is visible in the compiled JavaScript
- **Local Storage**: Session tokens are stored in plain localStorage
- **No Rate Limiting**: No protection against brute force attempts

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

To create or update your admin password:

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
├── index.html              # Main app page
├── login.html              # Login page
├── player.html             # Video player page (for QR scans)
├── package.json
├── vite.config.js
├── .env.example
├── scripts/
│   └── hash-password.js    # Password hashing utility
└── src/
    ├── js/
    │   ├── auth.js         # Authentication logic
    │   ├── db.js           # IndexedDB wrapper
    │   ├── qr.js           # QR generation
    │   └── ui.js           # UI interactions
    ├── styles/
    │   ├── vars.css        # CSS variables (theme)
    │   ├── layout.css      # Layout styles
    │   ├── components.css  # Component styles
    │   └── player.css      # Video player styles
    └── assets/
        └── logo.svg        # App logo
```

## Usage

### Logging In

1. Navigate to the app URL
2. Enter your admin password
3. Click "Login"

### Generating QR Codes

1. Go to the "Generate" tab
2. Enter the video URL
3. Customize size, colors, and margins (optional)
4. Upload a logo (optional)
5. Preview the QR code
6. Click "Generate QR" to save

### Managing QR Codes

1. Go to the "List" tab
2. View all saved QR codes
3. Click on any QR to view full-size
4. Download as PNG or SVG
5. Copy URL or delete as needed

### Video Player Feature

When you enter an MP4 URL, Aither automatically creates a QR code that links to a custom video player instead of the raw MP4 file. This provides a better user experience:

**How it works:**
1. Enter an MP4 URL (e.g., `https://example.com/video.mp4`)
2. The QR code will link to: `https://yoursite.com/player.html?video=<encoded-url>`
3. When scanned, visitors see a beautiful video player with:
   - Play/pause controls
   - Fullscreen support (double-click video)
   - Mobile-optimized layout
   - Dark theme matching the app
   - **Built-in QR scanner** for watching multiple videos

**Benefits:**
- Videos play directly in the browser (no download required)
- Consistent viewing experience across devices
- Professional presentation for museum visitors
- Works perfectly on mobile devices after QR scanning
- **No login required** - The player page is completely public and accessible to anyone

The original MP4 URL is saved for your reference in the library.

**Note:** Only the admin app (Generate/List tabs) requires login. The video player page is public so visitors can watch videos without authentication.

### Scanning Multiple Videos

Visitors can watch multiple videos without leaving the player:

1. Watch the first video after scanning a QR code
2. Click the **"Scan Another QR"** button in the player
3. Camera opens with QR scanner
4. Scan a new QR code for another video
5. New video loads automatically and starts playing

This feature is perfect for museum exhibits where visitors want to explore multiple ASL videos without repeatedly opening their camera app.

## Customization

### Theme Colors

Edit `/src/styles/vars.css` to customize the color scheme:

```css
:root {
  --bg: #0b2a37;      /* Background */
  --panel: #0f3b56;   /* Card/panel background */
  --accent: #0ea5b7;  /* Accent color */
  --muted: #9fb8c0;   /* Muted text */
  --text: #e6f7f8;    /* Primary text */
}
```

### QR Code Defaults

Edit `/src/js/qr.js` to change default QR code settings.

## Troubleshooting

### Login not working
- Check that your `.env` file has the correct `VITE_ADMIN_PASS_HASH`
- Restart the dev server after changing `.env`
- Clear browser localStorage and try again

### QR codes not saving
- Check browser console for IndexedDB errors
- Ensure you're not in private/incognito mode
- Check that localStorage is enabled

### Build fails
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 16 or higher
- Check for syntax errors in `.env`

## Contributing

This is an internal museum tool. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use and modify for your needs.

## Support

For questions or issues:
- Check the browser console for errors
- Review the troubleshooting section above
- Open an issue on GitHub

---

Built with care for the ASL museum community.
