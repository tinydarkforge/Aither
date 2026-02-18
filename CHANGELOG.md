# Changelog

All notable changes to Aither will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-11-24

### Added

#### Native-Like Mobile Video Experience
- **Auto-fullscreen on video load**: "Start Video" button triggers fullscreen mode (required for browser security)
- **Landscape orientation locking**: Forces horizontal viewing on mobile devices
- **Device-specific implementations**:
  - iOS: CSS-based fullscreen preserves HTML overlay controls
  - Android: Native Fullscreen API with Screen Orientation lock
  - Cross-browser support with webkit, moz, and ms prefixes
- **Rotation prompts**: "Please rotate your device" overlay when in portrait mode
- **Mobile-optimized meta tags**: Viewport settings and web app capabilities
- **Comprehensive device detection**: Automatic iOS/Android/mobile detection

#### Video Player Enhancements
- **Always-visible QR scan button**: Overlay button stays visible in fullscreen (z-index: 1,000,000)
- **Scanner modal overlay**: QR scanner appears above fullscreen video (z-index: 10,000,000)
- **Seamless video switching**: Scan new QR codes without exiting fullscreen
- **iOS-specific fullscreen**: CSS fullscreen mode preserves overlay buttons on iPhone/iPad
- **Touch-optimized controls**: 48px buttons for easy mobile interaction
- **Fullscreen toggle**: Double-tap video to enter/exit fullscreen

#### Modal UI Improvements
- **Download button icons**: Replaced "Download" text with icon + format label
- **Compact modal spacing**: Reduced padding and margins for cleaner appearance
- **Smaller modal buttons**: 38px height for better proportions
- **Tighter QR preview**: Minimal white box padding with fit-content sizing
- **Better visual hierarchy**: Icons improve scannability and professionalism

#### Theme Enhancements
- **Daniel Oceno brand colors**: Dark theme updated with purple/blue aesthetic (#6366F1 accent)
- **Professional dark mode**: Deep navy backgrounds with indigo accents
- **Improved contrast**: Better text readability in dark mode
- **Consistent branding**: Matches example.com design language

#### Form Layout Improvements
- **3-column grid system**: Fixed grid layout for consistent form structure
- **Uniform input heights**: All inputs and buttons standardized to 42px
- **Logical row organization**:
  - Row 1: URL, Title, Description
  - Row 2: Foreground Color, Background Color, Logo
  - Row 3: Size, Margin, Generate Button
- **Better alignment**: Color pickers match input field heights

### Changed

#### Mobile Player Architecture
- **iOS fullscreen method**: Switched from native `video.webkitEnterFullscreen()` to CSS fullscreen
  - Reason: Native iOS fullscreen removes all HTML overlays
  - Solution: `position: fixed` with full viewport coverage
  - Benefit: QR scan button remains accessible
- **Z-index hierarchy**: Established clear layering system
  - iOS fullscreen video: 999,999
  - QR scan button: 1,000,000
  - Scanner modal: 10,000,000
  - Scanner container: 10,000,001
- **User interaction flow**: Start Video button provides required user gesture for fullscreen

#### Video Player Meta Tags
- **Viewport optimization**: `maximum-scale=1.0, user-scalable=no` for web app feel
- **Mobile web app capable**: `apple-mobile-web-app-capable="yes"` for iOS
- **Status bar styling**: `black-translucent` for immersive fullscreen
- **Video attributes**: Added `webkit-playsinline`, `x5-playsinline`, `x5-video-orientation`

#### Form Design
- **Grid from auto-fit to fixed**: Changed to `repeat(3, 1fr)` for consistent 3-column layout
- **Description field type**: Changed from `<textarea>` to `<input type="text">` for height consistency
- **Button positioning**: Removed special button classes in favor of uniform grid cells
- **Color picker styling**: Fixed height and internal sizing for better alignment

### Fixed

#### iOS Overlay Issues
- **QR button visibility**: Fixed QR scan button disappearing in iOS fullscreen
- **Scanner z-index**: Scanner now properly overlays fullscreen video
- **Button persistence**: Overlay buttons use `!important` to ensure visibility
- **Touch target sizes**: Increased to 48px for better mobile usability

#### Modal Spacing
- **Excessive padding**: Reduced modal body and footer padding
- **QR preview size**: Minimized white box around QR code (8px padding vs 16px)
- **Button-to-content gap**: Reduced spacing between QR and action buttons
- **Info section margins**: Tighter spacing in modal info displays

#### Form Layout Consistency
- **Grid column overflow**: Fixed auto-fit creating too many columns
- **Input height mismatch**: All form inputs now consistently 42px
- **Color picker alignment**: Fixed color input wrapper height issues
- **Label spacing**: Consistent vertical rhythm across all form rows

### Technical Details

#### Orientation Locking
- **Primary lock**: `screen.orientation.lock('landscape')`
- **Fallback**: `screen.orientation.lock('landscape-primary')`
- **Detection**: Real-time orientation change monitoring
- **User feedback**: Visual prompt when user holds phone vertically

#### Browser Compatibility
- **iOS Safari**: CSS fullscreen with webkit prefixes
- **Android Chrome**: Native Fullscreen API with orientation lock
- **Desktop browsers**: Standard Fullscreen API
- **Graceful degradation**: Falls back to standard video controls if APIs unavailable

#### Debugging Features
- **Console logging**: Comprehensive logs for device detection and fullscreen attempts
- **Error handling**: Try-catch blocks with descriptive error messages
- **State tracking**: Monitors fullscreen state, orientation, and video playback

---

## [1.0.0] - 2025-01-23

### Added

#### Multi-Tenant Organization System
- **Organization management**: Superadmin can create and manage multiple organizations
- **Organization isolation**: Each organization has separate data, authentication, and QR code libraries
- **Per-organization login**: Unique credentials for each organization with secure password hashing
- **Password management**: Superadmin can reset organization passwords from admin panel
- **Organization listing**: View all organizations with their login links and creation dates

#### Superadmin Features
- **Superadmin panel** (`admin.html`): Dedicated interface for organization management
- **Password reset utility** (`reset-admin.html`): Self-service password recovery for superadmin
- **Password override**: Superadmin can update their password from within the admin panel
- **Secure authentication**: SHA-256 hashed superadmin password stored via environment variables

#### Bulk Collection Generation
- **Directory URL parsing**: Extract all video links from directory listing pages
- **Automatic collection creation**: Generate QR codes for all videos in a directory with one click
- **Smart MP4 filtering**: Automatically identifies and filters MP4 video links
- **Collection organization**: Group related QR codes by collection name for easy management
- **Batch operations**: Process multiple videos simultaneously with progress feedback

#### Theme System
- **Light/Dark mode switcher**: Toggle between light and dark themes
- **User preference persistence**: Theme choice saved to localStorage
- **Modern SaaS design**: Clean, professional interface inspired by example.com
- **Adaptive player theme**: Video player respects user theme preference
- **CSS custom properties**: Complete theme system using CSS variables

#### Video Player Enhancements
- **In-player QR scanner**: Scan QR codes for additional videos without leaving the player
- **Seamless video switching**: New videos load and play automatically after scanning
- **Mobile-optimized scanning**: Camera access and QR detection optimized for mobile devices
- **Continuous viewing experience**: Watch multiple videos in sequence without app switching
- **Fullscreen support**: Double-click video to enter/exit fullscreen mode

#### User Experience
- **Custom favicon**: Branded favicon with QR code and "A" design
- **Keyboard shortcuts**: Efficient navigation for power users
- **Responsive layout**: Optimized for desktop, tablet, and mobile devices
- **Loading states**: Visual feedback for async operations
- **Toast notifications**: Non-intrusive feedback for user actions
- **Search functionality**: Filter QR codes by URL, title, or description
- **QR code editing**: Edit titles and descriptions after creation
- **Bulk URL input**: Enter multiple video URLs manually (alternative to directory parsing)
- **Collection rescanning**: Rescan directories to add new videos to existing collections

#### Backup & Export (Backend Implemented)
- **Organization export**: Export all QR codes for an organization as JSON
- **Organization import**: Restore data from JSON backups
- **Superadmin export**: Export all organizations and data
- **Data validation**: Import validation to prevent data corruption

#### Legal & Security Documentation
- **MIT LICENSE**: Open source under MIT license
- **SECURITY.md**: Security policy and responsible disclosure
- **SECURITY.md**: Security policy, limitations, and responsible disclosure policy
- **Copyright headers**: Added to all source files (JavaScript and CSS)
- **Copyright footers**: Visible copyright notices on all HTML pages

#### Code Protection
- **JavaScript obfuscation**: Production builds use javascript-obfuscator for code protection
- **Minification**: Terser minification for optimized bundle size
- **Build-time protection**: Obfuscation only applied to production builds (dev builds remain readable)
- **Moderate obfuscation settings**: Balance between security and performance
- **Self-defending code**: Protection against code beautification and debugging

#### Security Enhancements
- **Secure .gitignore**: Prevents accidental commit of sensitive files (.env, certificates, credentials)
- **Environment variable protection**: Superadmin password stored in .env and Vercel environment variables
- **Session management**: 24-hour session expiration with localStorage
- **Multi-tenant isolation**: Data filtering by organizationId in all database queries
- **Security best practices**: Documented in SECURITY.md with clear limitations

### Changed

#### Design & Branding
- **Replaced JW.org-inspired theme** with modern SaaS design
- **Updated color palette**: Professional colors matching example.com branding
- **Improved typography**: Better font hierarchy and readability
- **Enhanced component styling**: Modernized buttons, inputs, cards, and navigation
- **Refined spacing**: Consistent padding and margins throughout the app

#### Architecture
- **Database schema**: Extended IndexedDB schema to support organizations and collections
- **Authentication flow**: Multi-level authentication (superadmin + per-organization)
- **Build configuration**: Updated Vite config for obfuscation and multiple entry points
- **Package metadata**: Added author, copyright, and license fields to package.json

#### Navigation
- **Added Collections tab**: New tab for bulk QR code generation
- **Reorganized tabs**: Generate, List, and Collections for better workflow
- **Improved tab switching**: Smoother transitions and state persistence
- **Admin navigation**: Dedicated navigation for superadmin panel

#### README Documentation
- **Comprehensive feature documentation**: Detailed descriptions of all major features
- **Multi-tenant usage guide**: Instructions for superadmin and organization admins
- **Bulk collection tutorial**: Step-by-step guide for directory URL parsing
- **Security clarifications**: Clear warnings about client-side security limitations
- **Legal references**: Links to LICENSE, TERMS.md, and SECURITY.md
- **Updated project structure**: Accurate file tree with all new files

### Fixed

#### Authentication
- **Session persistence**: Fixed session timeout not properly expiring after 24 hours
- **Organization isolation**: Fixed potential data leakage between organizations
- **Password hashing consistency**: Ensured consistent SHA-256 hashing across all auth flows

#### UI/UX
- **Theme persistence**: Fixed theme not persisting across sessions
- **Mobile responsiveness**: Fixed layout issues on small screens
- **Tab state**: Fixed tab state not persisting on page reload
- **Form validation**: Improved input validation and error messaging

#### Database
- **IndexedDB initialization**: Fixed race conditions during database setup
- **Query optimization**: Improved performance of organization-filtered queries
- **Data consistency**: Fixed edge cases where QR codes could be orphaned

### Security

#### Added Protections
- **Code obfuscation**: Production code now obfuscated to protect intellectual property
- **Legal documentation**: TERMS.md and SECURITY.md establish usage terms and security expectations
- **Proprietary license**: LICENSE file establishes copyright and usage restrictions
- **.gitignore security**: Prevents accidental exposure of .env files and credentials

#### Known Limitations (Documented)
- **Client-side authentication**: Can be bypassed by users with browser dev tools
- **No password salting**: SHA-256 hashing without salts (vulnerable to rainbow tables)
- **LocalStorage sessions**: Session tokens stored in plain localStorage (vulnerable to XSS)
- **No rate limiting**: No protection against brute force password attempts
- **Visible hash in build**: Superadmin password hash embedded in compiled JavaScript

**Note:** These limitations are acceptable for internal use with trusted staff. See SECURITY.md for detailed security information and recommendations.

### Deployment

#### Vercel Configuration
- **Environment variables**: Documented VITE_ADMIN_PASS_HASH configuration
- **Build settings**: Optimized build command and output directory
- **Multi-page routing**: Configured for multiple HTML entry points
- **Static hosting**: Production-ready configuration for Vercel deployment

#### Build Process
- **Vite 5.0**: Upgraded to latest Vite for better performance
- **Multiple entry points**: index.html, login.html, player.html, admin.html, reset-admin.html
- **Production optimization**: Minification, obfuscation, and asset optimization
- **Development mode**: Fast HMR and unobfuscated code for debugging

---

## [0.1.0] - 2025-01-01 (Initial Internal Release)

### Added
- Basic QR code generation for video URLs
- Client-side IndexedDB storage via Dexie.js
- Single-user password authentication
- Dark theme inspired by JW.org
- Video player page for MP4 QR codes
- QR code customization (size, colors, logo)
- Export as PNG or SVG
- Local data persistence via IndexedDB

### Initial Features
- Pure static app (no backend required)
- SHA-256 password hashing
- QR code library management
- Video URL validation
- Mobile-responsive design
- Vite-based build system

---

## Future Roadmap

### Planned Features (v1.1.0)
- [ ] Global error boundary and improved error handling
- [ ] Enhanced loading states and retry mechanisms
- [ ] Password strength requirements
- [ ] Session timeout warnings
- [ ] Bulk delete operations
- [ ] Expose backup/export UI in admin panel (backend implemented)

### Under Consideration
- [ ] 2FA/MFA for superadmin
- [ ] Encrypted IndexedDB storage
- [ ] Audit logging for admin actions
- [ ] CSV export for QR code metadata
- [ ] Print-friendly QR code layouts
- [ ] Custom QR code templates
- [ ] Analytics dashboard (usage statistics)

### Not Planned (Out of Scope)
- Server-side authentication
- Database encryption at rest
- API rate limiting
- Server-side audit logs
- DDoS protection

For these features, consider using Aither with a custom backend implementation.

---

## Version History

- **1.0.0** (2025-01-23) - Multi-tenant SaaS release with code protection
- **0.1.0** (2025-01-01) - Initial internal release

---

**© 2025 Daniel Oceno. MIT License.**

For questions about this changelog or version history, contact: hello@danieloceno.com
