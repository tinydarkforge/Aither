# Aither - TODO List

## Planned Tasks

### 1. Password Form Enhancements (Admin Panel)
**Priority**: High
**Status**: Completed ✅

Improve the organization creation experience by adding password confirmation and visibility toggles.

**Requirements**:
- [x] Add "Confirm Password" field to the "Create New Organization" form in `admin.html`.
- [x] Implement "Show/Hide Password" icons for all password fields (Create, Rename, Reset, Superadmin settings).
- [x] Add client-side validation to ensure passwords match before submission.
- [x] Update `auth.js` or `admin.html` script to handle the new validation and toggle logic.

### 2. UI Redesign ("Less is More" Aesthetic)
**Priority**: Medium
**Status**: Completed ✅

Redesign the interface to move away from "AI-style" aesthetics (gradients, heavy shadows) toward a modernist, functionalist look inspired by `less-is-more-ui`.

**Requirements**:
- [x] **Palette Update**: Switch to neutral foundations (soft grays, off-whites, deep charcoals) in `vars.css`.
- [x] **Component Simplification**: Replace heavy box-shadows with thin borders (`1px solid var(--border)`) in `components.css`.
- [x] **Functional Color**: Use accent colors strictly for state or primary actions, removing decorative gradients.
- [x] **Spacing & Typography**: Implement a strict, scale-based spacing system and prioritize typographic hierarchy.
- [x] **Modernist Reduction**: Remove non-functional decorative elements to improve focus and reduce visual noise.

## Feature Roadmap

### Multi-Language Support
**Priority**: Medium
**Status**: Planned

Add multi-language/internationalization (i18n) support to make Aither accessible to users worldwide.

**Requirements**:
- [ ] Choose i18n library (e.g., i18next, vue-i18n, or vanilla JS solution)
- [ ] Add language selector UI component
- [ ] Translate admin interface (login, QR generator, library)
- [ ] Translate video player interface
- [ ] Support for language-specific video titles and descriptions in QR metadata
- [ ] Language preference persistence (localStorage)
- [ ] Default to browser language on first visit

**Initial Languages to Support**:
- English (current default)
- Spanish
- French
- German
- Mandarin Chinese
- Japanese

**Technical Considerations**:
- Keep bundle size minimal (consider lazy-loading language files)
- Ensure RTL (right-to-left) language support for Arabic, Hebrew
- Date/time formatting per locale
- Number formatting per locale

**Estimated Effort**: 2-3 days

---

## Future Enhancements

### Analytics & Tracking (Optional)
- Client-side analytics without compromising privacy
- QR code scan counts (if server component added)
- Popular video tracking

### Enhanced Accessibility
- Screen reader optimization
- Keyboard navigation improvements
- WCAG 2.1 AA compliance
- High contrast mode
- Adjustable font sizes

### Video Features
- Video chapters/timestamps
- Playlists from collections
- Video subtitles/captions support
- Video thumbnails in QR preview

---

**Last Updated**: 2026-05-22
