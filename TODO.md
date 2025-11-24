# Aither - TODO List

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

**Last Updated**: 2025-11-24
