# Aither User Guide

**Copyright © 2025 Daniel Oceno. MIT License.**

Welcome to Aither! This comprehensive guide will help you get started with creating, managing, and sharing QR codes for your video content.

## Table of Contents

1. [Quick Start](#quick-start)
2. [For Superadmins](#for-superadmins)
3. [For Organization Administrators](#for-organization-administrators)
4. [For Viewers](#for-viewers)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [FAQ](#faq)

---

## Quick Start

### What is Aither?

Aither is a QR code generator for video content. Perfect for exhibits, advertising campaigns, events, product showcases, and more. It allows organizations to:

- Create professional QR codes for video content
- Manage multiple organizations with separate credentials
- Generate QR codes in bulk from directory URLs
- Provide a seamless viewing experience for audiences
- Operate completely offline after initial setup

### User Roles

Aither has three user roles:

1. **Superadmin**: Manages the entire system and creates organizations
2. **Organization Administrator**: Creates and manages QR codes for their organization
3. **Viewer**: Scans QR codes to watch videos (no login required)

---

## For Superadmins

### First-Time Setup

#### 1. Set Your Superadmin Password

When you first deploy Aither, you need to set your superadmin password:

1. Run the password hash generator:
   ```bash
   npm run hash-password
   ```

2. Enter your desired password when prompted
3. Copy the generated hash
4. Create a `.env` file in the project root:
   ```
   VITE_ADMIN_PASS_HASH=<your-hash-here>
   ```

5. **For Vercel deployment:**
   - Go to Project Settings → Environment Variables
   - Add `VITE_ADMIN_PASS_HASH` with your hash
   - Redeploy the application

**Security Tip:** Use a strong password with at least 16 characters, including uppercase, lowercase, numbers, and symbols.

#### 2. Access the Superadmin Panel

1. Navigate to `https://yoursite.com/admin.html`
2. Enter your superadmin password
3. Click "Login to Admin Panel"

You'll see the organization management interface.

### Managing Organizations

#### Creating a New Organization

1. In the Superadmin Panel, locate the "Create New Organization" section
2. Fill in the organization details:
   - **Organization Name**: Your organization name (e.g., "Acme Corporation", "City Art Gallery", "Tech Conference 2025")
   - **Password**: A secure password for this organization's administrators
3. Click "Create Organization"

**What happens next:**
- The organization is created in the database
- A unique organization ID is assigned
- The password is hashed and stored securely
- You'll see the organization appear in the list below

#### Viewing Organizations

The organization list shows:
- **Organization Name**: The organization name
- **Login Link**: Direct link for organization admins to login
- **Created**: When the organization was created
- **Reset Password**: Button to change the organization's password

**Using Login Links:**
- Click the login link to copy it to clipboard
- Share this link with the organization's administrators
- The link automatically pre-fills the organization on the login page

#### Resetting Organization Passwords

If an organization forgets their password:

1. Find the organization in the list
2. Click the "Reset Password" button
3. Enter a new password
4. Click "Confirm Reset"
5. Share the new password with the organization (via secure channel)

**Security Note:** Never share passwords via email. Use a secure messaging service or phone call.

#### Changing Your Superadmin Password

There are two ways to change your superadmin password:

**Method 1: From the Admin Panel**
1. In the Superadmin Panel, find the "Update Superadmin Password" section
2. Enter your current password
3. Enter your new password
4. Click "Update Password"
5. The app will rebuild with the new hash

**Method 2: Using the Reset Utility (if you forgot your password)**
1. Navigate to `https://yoursite.com/reset-admin.html`
2. Enter your new password
3. Copy the generated hash
4. Update your `.env` file or Vercel environment variable
5. Redeploy or restart the application

### Superadmin Best Practices

- ✅ Use a unique, strong superadmin password
- ✅ Store the password in a password manager
- ✅ Limit superadmin access to trusted personnel only
- ✅ Regularly review the organization list
- ✅ Delete unused organizations to maintain security
- ✅ Use the password reset feature sparingly
- ✅ Document which organizations are active

---

## For Organization Administrators

### Logging In

#### First Time Login

1. You'll receive a login link from the superadmin (e.g., `https://yoursite.com/login.html?org=123`)
2. Click the link to open the login page
3. Your organization should be pre-selected
4. Enter the password provided by the superadmin
5. Click "Login"

**If the organization is not pre-selected:**
1. Navigate to `https://yoursite.com/login.html`
2. The dropdown will list all organizations
3. Select your organization
4. Enter your password
5. Click "Login"

#### Session Management

- Your session lasts **24 hours**
- After 24 hours, you'll need to log in again
- Sessions are stored in your browser's localStorage
- Clearing browser data will log you out

**Tip:** Bookmark the login link for quick access.

### Generating Individual QR Codes

#### Step 1: Navigate to the Generate Tab

After logging in, you'll see three tabs:
- **Generate**: Create individual QR codes
- **List**: View and manage existing QR codes
- **Collections**: Generate bulk QR codes from directory URLs

Click the **Generate** tab.

#### Step 2: Enter Video URL

1. In the "Video URL" field, paste your video URL
2. The URL should point to an MP4 file (e.g., `https://example.com/video.mp4`)
3. If the URL ends in `.mp4`, Aither will automatically create a player-wrapped QR code

**What are player-wrapped QR codes?**
- Regular QR codes link directly to the MP4 file
- Player-wrapped QR codes link to a custom video player
- The player provides better UX: controls, fullscreen, QR scanner
- Visitors don't need to download the video

#### Step 3: Customize QR Code (Optional)

**Size:**
- Adjust the size slider (100-500px)
- Larger QR codes are easier to scan from a distance
- Recommended: 300px for printed materials

**Colors:**
- **Dots Color**: Color of the QR code dots (default: black)
- **Background**: Background color (default: white)
- Use high contrast for better scanning reliability

**Margins:**
- Adjust margin slider (0-20px)
- Margins provide "quiet zone" for better scanning
- Recommended: 10px minimum

**Logo:**
- Click "Choose File" to upload a logo
- Logo appears in the center of the QR code
- Recommended: Square images, PNG with transparency
- Maximum logo size: 20% of QR code area

#### Step 4: Generate and Save

1. Review the preview of your QR code
2. If satisfied, click "Generate QR Code"
3. The QR code is saved to your organization's library
4. A success message confirms the save

**The QR code includes:**
- The video URL (or player URL for MP4s)
- Creation timestamp
- Your organization ID

### Managing Your QR Code Library

#### Viewing QR Codes

1. Click the **List** tab
2. You'll see all QR codes created by your organization
3. Each card shows:
   - QR code preview
   - Video URL (original MP4 URL if player-wrapped)
   - Player URL (for MP4s)
   - Created date
   - Collection name (if part of a collection)

#### Downloading QR Codes

Each QR code can be downloaded in two formats:

**PNG Format:**
1. Click "Download PNG"
2. A PNG image file downloads
3. Use for: Printing, presentations, web graphics

**SVG Format:**
1. Click "Download SVG"
2. An SVG vector file downloads
3. Use for: Large-format printing, professional graphics

**Tip:** SVG files scale infinitely without quality loss, making them ideal for large posters.

#### Copying URLs

**Copy Video URL:**
- Click "Copy URL" to copy the original video URL
- Use this to share the direct MP4 link

**Copy Player URL:**
- For player-wrapped QR codes, you can copy the player URL
- This is the URL visitors will see when they scan the QR code
- Format: `https://yoursite.com/player.html?video=<encoded-url>`

#### Deleting QR Codes

1. Click "Delete" on the QR code card
2. Confirm the deletion
3. The QR code is permanently removed from your library

**Warning:** Deletion is permanent and cannot be undone. If visitors have already scanned the QR code, the player URL will still work, but you won't have the QR code in your library anymore.

### Generating Bulk Collections

The Collections feature allows you to generate dozens or hundreds of QR codes at once from a directory listing.

#### What is a Directory URL?

A directory URL is a webpage that lists files, typically an Apache-style directory listing:

```
Index of /videos/

- video1.mp4
- video2.mp4
- video3.mp4
- ...
```

**Example directory URLs:**
- `https://example.com/videos/`
- `https://mycompany.com/product-demos/`
- `https://event.org/presentations/`

#### Step 1: Navigate to Collections Tab

Click the **Collections** tab at the top of the page.

#### Step 2: Enter Directory URL

1. In the "Directory URL" field, paste the directory listing URL
2. Click "Parse Directory"
3. Aither will fetch the page and extract all MP4 links

**What happens during parsing:**
- The page is fetched via CORS (must be publicly accessible)
- HTML is scanned for links ending in `.mp4`
- Links are extracted and displayed in the preview area

#### Step 3: Review Extracted URLs

After parsing, you'll see:
- **Count**: Number of MP4 files found
- **List**: Preview of the URLs that will be processed

**Review the list carefully:**
- Ensure all URLs are correct
- Check for duplicates
- Verify all are video files you want to include

**If something looks wrong:**
- Click "Parse Directory" again to re-fetch
- Check the directory URL is correct
- Check browser console for errors

#### Step 4: Name Your Collection

1. Enter a collection name (e.g., "Founding Fathers Exhibit")
2. Use descriptive names to organize your library
3. All QR codes in this batch will be tagged with this collection name

#### Step 5: Generate Collection

1. Click "Generate Collection"
2. Aither will create QR codes for each video URL
3. Progress is shown in real-time
4. When complete, all QR codes are saved to your library

**Processing time:**
- 10 videos: ~5 seconds
- 50 videos: ~20 seconds
- 100 videos: ~40 seconds

#### Step 6: View and Download

1. Go to the **List** tab
2. You'll see all newly created QR codes
3. Each is tagged with the collection name
4. Download individually as PNG or SVG

**Bulk Download Tip:** Use your browser's "Save As" feature to download multiple QR codes at once by opening each in a new tab.

### Organization Best Practices

- ✅ Use descriptive collection names (e.g., "2025 Summer Exhibit")
- ✅ Test QR codes before printing (scan with your phone)
- ✅ Download QR codes as SVG for high-quality printing
- ✅ Keep a backup of your video URLs
- ✅ Organize QR codes by exhibit or location
- ✅ Regularly review and delete unused QR codes
- ✅ Use high-contrast colors (dark on light background)
- ✅ Include logos for branding consistency

---

## For Viewers

### Scanning QR Codes

#### Using Your Phone's Camera

**iPhone (iOS 11+):**
1. Open the Camera app
2. Point at the QR code
3. A notification appears at the top
4. Tap the notification to open the video player

**Android (Android 9+):**
1. Open the Camera app or Google Lens
2. Point at the QR code
3. Tap the link that appears
4. Video player opens

**Older Phones:**
1. Download a QR scanner app (e.g., "QR Code Reader")
2. Open the app
3. Point at the QR code
4. Tap to open the link

### Watching Videos

After scanning a QR code, you'll see the Aither video player:

#### Player Controls

- **Play/Pause**: Tap the video or use the play button
- **Fullscreen**: Double-tap the video to enter fullscreen
- **Volume**: Use your device's volume buttons
- **Scrubbing**: Drag the progress bar to skip ahead/back

#### Player Features

- **Adaptive Theme**: Player matches your device's light/dark preference
- **Mobile Optimized**: Touch-friendly controls
- **Offline Capable**: Once loaded, works without internet
- **No Login Required**: Open to all visitors

#### Mobile Experience

When you scan a QR code on your phone, Aither provides a **native app-like video experience**:

**Getting Started:**
1. After scanning a QR code, you'll see a large "Start Video" button
2. Tap this button to begin watching
3. The video automatically enters fullscreen mode
4. Your phone locks to landscape (horizontal) orientation

**Landscape Mode:**
- Hold your phone horizontally to watch the video
- If you hold it vertically, you'll see a "Please rotate your device" prompt
- This ensures the best viewing experience
- The video fills your entire screen for immersive viewing

**Fullscreen QR Scanner:**
- Even in fullscreen, you'll see a small QR code button in the top-left corner
- Tap this button to scan another QR code without leaving fullscreen
- The camera appears as an overlay on top of the video
- After scanning, the new video loads immediately in fullscreen

**Device-Specific Features:**
- **iPhone/iPad**: Uses a special fullscreen mode that keeps all buttons visible
- **Android**: Uses native fullscreen with orientation locking
- **All devices**: Touch-optimized controls designed for easy one-handed use

**Why This Matters:**
- Viewers get a professional, app-like experience
- No distractions from browser UI or notifications
- Easy navigation between multiple videos
- Optimized for the way people naturally hold their phones

**Tip:** Once you start the first video, you can scan and watch multiple QR codes without ever leaving fullscreen mode!

### Scanning Multiple Videos

You can watch multiple videos without leaving the player:

#### Step 1: Watch the First Video

1. Scan a QR code as usual
2. Video loads and plays

#### Step 2: Scan Another QR Code

1. Look for the "Scan Another QR" button (bottom of player)
2. Tap the button
3. Your camera opens with a QR scanner

#### Step 3: Point at Next QR Code

1. Point your camera at another QR code
2. The QR is detected automatically
3. Camera closes
4. New video loads and plays immediately

#### Step 4: Repeat

Continue scanning QR codes to explore the exhibit without ever closing the player.

**Why this is awesome:**
- No need to repeatedly open your camera app
- Seamless viewing experience
- Fast switching between videos
- Perfect for self-guided tours

### Visitor Best Practices

- ✅ Ensure good lighting when scanning QR codes
- ✅ Hold your phone steady about 6-12 inches from the QR code
- ✅ If the QR won't scan, try adjusting the angle
- ✅ Use headphones for better audio experience
- ✅ Enable captions if available
- ✅ Use fullscreen mode for better viewing
- ✅ Be mindful of other visitors when using audio

---

## Advanced Features

### Theme Switching

Aither supports light and dark themes:

#### Switching Themes

1. Look for the theme toggle button (sun/moon icon) in the navigation
2. Click to toggle between light and dark mode
3. Your preference is saved automatically

**Where themes apply:**
- Main app interface (Generate, List, Collections)
- Login page
- Superadmin panel
- Video player (adaptive to device preference)

**Theme Persistence:**
- Theme choice is saved to localStorage
- Persists across sessions
- Applies immediately without refresh

### Keyboard Shortcuts

Power users can use keyboard shortcuts for faster navigation:

- **Tab**: Move between form fields
- **Enter**: Submit forms (login, generate QR)
- **Escape**: Close modals and popups
- **Ctrl/Cmd + S**: Quick save (in generate tab)

### URL Parameters

You can use URL parameters for direct access:

**Organization Login:**
```
https://yoursite.com/login.html?org=123
```
Pre-selects organization with ID 123.

**Video Player:**
```
https://yoursite.com/player.html?video=<encoded-url>
```
Loads specific video in player.

### Browser Compatibility

Aither works on modern browsers:

- ✅ Chrome 90+ (recommended)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

**Required Features:**
- JavaScript enabled
- IndexedDB support
- LocalStorage support
- Modern CSS (CSS Grid, CSS Variables)

---

## Troubleshooting

### Login Issues

#### "Invalid password" error

**Solution:**
1. Verify you're selecting the correct organization
2. Check for typos (passwords are case-sensitive)
3. Contact your superadmin for password reset
4. Try clearing browser cache and cookies

#### Organization not showing in dropdown

**Solution:**
1. Contact superadmin to verify organization exists
2. Check that JavaScript is enabled
3. Try refreshing the page
4. Check browser console for errors

#### Session expired too quickly

**Solution:**
1. Sessions last 24 hours by default
2. Check your system clock is accurate
3. Don't use private/incognito mode (sessions won't persist)
4. Check localStorage is enabled

### QR Code Generation Issues

#### "Failed to generate QR code" error

**Solution:**
1. Verify the video URL is valid and accessible
2. Check your internet connection
3. Try a different video URL
4. Check browser console for detailed error

#### QR code not saving

**Solution:**
1. Check that you're not in private/incognito mode
2. Ensure IndexedDB is enabled in your browser
3. Check available storage space
4. Try clearing old QR codes to free space

#### QR code preview is blank

**Solution:**
1. Refresh the page and try again
2. Check that the URL is valid
3. Try adjusting QR code settings
4. Check browser console for errors

### Collection Parsing Issues

#### "Failed to parse directory" error

**Solution:**
1. Verify the URL is publicly accessible (not behind login)
2. Check that the URL points to a directory listing
3. Ensure the page contains MP4 links
4. Some sites block CORS - try a different source

#### No MP4 files found

**Solution:**
1. Verify the directory actually contains MP4 files
2. Check that links end in `.mp4` (case-sensitive)
3. Try viewing the page directly in your browser
4. The parser may not work with JavaScript-generated listings

#### Parsing is very slow

**Solution:**
1. Large directories (100+ files) take longer to parse
2. Check your internet connection speed
3. Try parsing smaller subdirectories instead
4. Wait patiently - processing will complete

### Scanning Issues

#### QR code won't scan

**Solution:**
1. Ensure good lighting
2. Hold phone 6-12 inches from QR code
3. Try adjusting angle
4. Clean your camera lens
5. Try a different QR scanner app
6. Verify QR code printed clearly (not pixelated)

#### Scanned QR leads to error page

**Solution:**
1. Check that the Aither site is deployed and accessible
2. Verify the video URL is still active
3. Try scanning a different QR code to test
4. Check your internet connection

#### Video won't play in player

**Solution:**
1. Verify video URL is accessible
2. Check that video format is MP4
3. Some videos may be geo-restricted
4. Try a different browser
5. Check your internet connection

### Theme Issues

#### Theme not persisting

**Solution:**
1. Ensure localStorage is enabled
2. Don't use private/incognito mode
3. Check browser settings for storage permissions
4. Try manually selecting theme again

#### Theme looks broken

**Solution:**
1. Hard refresh the page (Ctrl/Cmd + Shift + R)
2. Clear browser cache
3. Check for browser extensions blocking CSS
4. Try a different browser

### Performance Issues

#### App is slow or unresponsive

**Solution:**
1. Clear old QR codes from library (delete unused)
2. Close other browser tabs
3. Restart your browser
4. Check for browser updates
5. Try on a different device

#### Building/deploying fails

**Solution:**
1. Delete `node_modules` and run `npm install` again
2. Ensure Node.js version is 16 or higher
3. Check `.env` file for syntax errors
4. Verify environment variables in Vercel
5. Check build logs for specific error messages

---

## Best Practices

### For Superadmins

**Security:**
- 🔒 Use strong, unique passwords
- 🔒 Store passwords in a password manager
- 🔒 Limit superadmin access to trusted personnel
- 🔒 Regularly review organization list
- 🔒 Use secure channels to share passwords (never email)

**Organization Management:**
- 📋 Document which organizations are active
- 📋 Use descriptive organization names
- 📋 Maintain a contact list for each organization
- 📋 Regularly audit inactive organizations
- 📋 Provide clear onboarding instructions to new orgs

### For Organization Administrators

**QR Code Creation:**
- 🎨 Use high-contrast colors (dark dots on light background)
- 🎨 Test QR codes before mass printing
- 🎨 Use logos for branding consistency
- 🎨 Keep margins at least 10px for scanning reliability
- 🎨 Download as SVG for high-quality printing

**Organization:**
- 📁 Use descriptive collection names
- 📁 Tag QR codes by exhibit or location
- 📁 Keep backups of video URLs
- 📁 Regularly review and delete unused QR codes
- 📁 Document which QR codes are deployed where

**Video URLs:**
- 🎬 Ensure videos are hosted on reliable servers
- 🎬 Use HTTPS URLs for security
- 🎬 Test video URLs before generating QR codes
- 🎬 Keep original videos backed up
- 🎬 Use descriptive filenames for videos

### For Viewers

**Scanning:**
- 📱 Ensure good lighting
- 📱 Hold phone steady 6-12 inches from QR code
- 📱 Use built-in camera app (iOS/Android)
- 📱 Try adjusting angle if scan fails
- 📱 Use in-player scanner for multiple videos

**Viewing:**
- 🎥 Use headphones for better audio
- 🎥 Enable captions if available
- 🎥 Use fullscreen for better viewing
- 🎥 Be mindful of your surroundings
- 🎥 Report broken QR codes if encountered

---

## FAQ

### General Questions

**Q: Do I need an internet connection to use Aither?**
A: For administrators, you need internet to log in and generate QR codes. For visitors, you need internet to load videos, but the player works offline once loaded.

**Q: Is my data stored in the cloud?**
A: No. All data is stored locally in your browser using IndexedDB. Nothing is sent to external servers.

**Q: Can I use Aither on mobile?**
A: Yes! Aither is fully responsive and works on phones and tablets.

**Q: Is Aither free?**
A: Aither is free and open source under the MIT License.

### Superadmin Questions

**Q: How many organizations can I create?**
A: There's no hard limit. The limit is browser storage capacity (typically gigabytes).

**Q: Can I delete an organization?**
A: Yes, use the database tools or contact support for bulk operations.

**Q: What happens if I forget my superadmin password?**
A: Use the reset utility at `/reset-admin.html` to generate a new password hash.

**Q: Can I have multiple superadmins?**
A: Currently, there's one superadmin password. Share it securely or implement custom multi-admin features.

### Organization Questions

**Q: How many QR codes can I create?**
A: There's no hard limit. Storage is limited by browser capacity (typically thousands of QR codes).

**Q: Can I edit a QR code after creating it?**
A: No, but you can delete and recreate it.

**Q: Can I export all my QR codes at once?**
A: Currently, you download them individually. Bulk export is planned for v1.1.

**Q: What video formats are supported?**
A: Aither works best with MP4 files. Other formats may work but aren't officially supported.

**Q: Can I use YouTube URLs?**
A: You can create QR codes for YouTube URLs, but they won't use the custom player.

### Visitor Questions

**Q: Do I need to create an account to watch videos?**
A: No! The video player is completely public and requires no login.

**Q: Why use the custom player instead of linking directly to the MP4?**
A: The custom player provides a better experience: controls, fullscreen, QR scanner, and branding.

**Q: Can I download the videos?**
A: The player is designed for streaming. Contact the content owner for download options.

**Q: What if a QR code doesn't work?**
A: Report it to the content provider. The video URL may have changed or the QR code may be damaged.

### Technical Questions

**Q: What browsers are supported?**
A: Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.

**Q: Can I self-host Aither?**
A: Yes, build with `npm run build` and deploy the `dist` folder to any static host.

**Q: Is the source code available?**
A: Yes! Aither is open source under the MIT License on GitHub.

**Q: How secure is the authentication?**
A: Client-side authentication is NOT enterprise-grade. See SECURITY.md for details.

---

## Getting Help

### Support Channels

**For general questions:**
- Email: hello@danieloceno.com
- Website: https://github.com/Pamperito74/Aither

**For security issues:**
- Email: hello@danieloceno.com
- See SECURITY.md for responsible disclosure

**For feature requests:**
- Contact: hello@danieloceno.com
- Include detailed use case and benefits

### Documentation

- **README.md**: Setup and technical documentation
- **SECURITY.md**: Security policy and limitations
- **TERMS.md**: Terms of Service
- **CHANGELOG.md**: Version history
- **USER_GUIDE.md**: This document

### Community

Aither is an open-source tool by Daniel Oceno. Contributions, issues, and feature requests are welcome on GitHub.

---

**© 2025 Daniel Oceno. MIT License.**

Thank you for using Aither! We hope this guide helps you create amazing QR code experiences for your audience.
