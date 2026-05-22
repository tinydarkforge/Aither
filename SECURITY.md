# Security Policy

## Overview

Aither is a client-side web application that operates entirely in the browser using vanilla JavaScript and IndexedDB for local storage. This document outlines security considerations, limitations, and best practices.

## Security Model

### Client-Side Architecture

**Important:** Aither runs 100% in the browser with no backend server. This architectural choice has significant security implications:

✅ **Advantages:**
- No server-side data breaches possible
- Data stays on the user's device
- No centralized database to attack
- Reduced attack surface for server vulnerabilities

⚠️ **Limitations:**
- Source code is visible to users (even when minified)
- Client-side authentication can be bypassed by determined attackers
- No server-side validation or rate limiting
- Data is only as secure as the user's device

## Authentication & Authorization

### Current Implementation

Aither uses **client-side password authentication** with SHA-256 hashing:

```javascript
// Password is hashed in the browser
const hash = await hashPassword(password);
// Hash is compared against stored hash in IndexedDB or .env
```

### Security Limitations

⚠️ **THIS IS NOT PRODUCTION-GRADE SECURITY**

**Known Limitations:**
1. **No Salt:** Passwords are hashed without salts, making them vulnerable to rainbow table attacks
2. **Client-Side Validation:** Authentication logic runs in the browser and can be bypassed
3. **LocalStorage Sessions:** Session tokens are stored in LocalStorage (vulnerable to XSS)
4. **No Rate Limiting:** No protection against brute force attacks
5. **Visible Source Code:** Authentication logic is exposed in JavaScript

### Recommendations

**For Development/Testing:**
- Current implementation is acceptable
- Use strong, unique passwords
- Don't reuse passwords from other services

**For Production Use:**
- Implement a proper backend with server-side authentication
- Use industry-standard solutions (OAuth, JWT with backend validation)
- Add rate limiting and account lockout mechanisms
- Implement proper password hashing with salts (bcrypt/argon2)
- Use HTTPOnly cookies instead of LocalStorage for sessions
- Add CAPTCHA or similar bot protection

## Data Storage

### IndexedDB

Aither stores all data locally using IndexedDB:

**What is stored:**
- Organization credentials (hashed passwords)
- QR code images and metadata
- Collections and video URLs
- User preferences (theme)
- Session tokens

**Security Notes:**
- Data persists in the browser until manually cleared
- Other websites cannot access this data (same-origin policy)
- Data is NOT encrypted at rest in IndexedDB
- Physically accessing the device could expose data
- Browser extensions may be able to read this data

**Recommendations:**
- Don't store sensitive/confidential information in QR codes
- Regularly export and backup important QR codes
- Clear browser data when using shared computers
- Use browser profiles for different organizations

## Environment Variables

### .env File

The `.env` file contains the superadmin password hash:

```env
VITE_ADMIN_PASS_HASH=<hash>
```

**Security Considerations:**
- This file should NEVER be committed to version control
- `.gitignore` must include `.env`
- The hash is embedded in the built JavaScript
- Anyone with access to the built files can see the hash

**Best Practices:**
- Change the default password immediately
- Use a strong, unique password (minimum 16 characters)
- Rotate passwords regularly
- Don't share the password hash publicly

## Deployment Security

### Vercel/Static Hosting

When deploying to platforms like Vercel:

**Required Actions:**
1. Set `VITE_ADMIN_PASS_HASH` as an environment variable in Vercel dashboard
2. Never commit .env files to Git
3. Use HTTPS only (force SSL redirect)
4. Set proper CSP (Content Security Policy) headers
5. Enable HSTS (HTTP Strict Transport Security)

**Recommended Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Known Vulnerabilities

### XSS (Cross-Site Scripting)

**Risk:** Moderate
- User-generated content (organization names, URLs) could contain malicious scripts
- Some input sanitization is implemented
- Not comprehensive protection

**Mitigation:**
- Input validation is performed on organization names
- HTML is escaped in most display contexts
- Further security audits recommended

### CSRF (Cross-Site Request Forgery)

**Risk:** Low
- No server-side state to manipulate
- All data is local to the browser

### Data Loss

**Risk:** Moderate
- Browser data can be cleared accidentally
- No automatic backups
- Device loss = data loss

**Mitigation:**
- Regularly export QR codes
- Document backup procedures for organizations
- Consider implementing export/import functionality

## Browser Security

### Required Minimum Security

For secure usage:
- ✅ Use modern, updated browsers (Chrome 90+, Firefox 88+, Safari 14+)
- ✅ Enable JavaScript (required for application to function)
- ✅ Use HTTPS only
- ✅ Keep browser and OS updated
- ✅ Use antivirus/anti-malware software
- ✅ Be cautious of browser extensions (they can access page data)

## Multi-Tenant Security

### Organization Isolation

Aither implements multi-tenant architecture:

**How it works:**
- Each organization has a separate login
- Data is filtered by `organizationId` in IndexedDB queries
- Sessions include organization context

**Limitations:**
- Isolation is enforced client-side only
- A technically skilled user could bypass filters
- No server-side enforcement of data isolation

**Recommendations:**
- Don't store competing organizations' data on the same device
- Use separate browser profiles for different organizations
- Clear browser data between organization sessions

## Responsible Disclosure

### Reporting Security Issues

If you discover a security vulnerability in Aither:

**Do:**
1. Email details to: hello@danieloceno.com
2. Include detailed steps to reproduce
3. Allow reasonable time for a fix (90 days suggested)
4. Avoid public disclosure until patch is available

**Don't:**
- Exploit the vulnerability
- Access data you don't own
- Publicly disclose before patch
- Attempt DDoS or destructive testing

### Response Timeline

- **24-48 hours:** Initial response and acknowledgment
- **7 days:** Assessment and severity classification
- **30 days:** Fix implementation (for high severity)
- **90 days:** Public disclosure (if applicable)

## Security Roadmap

### Future Enhancements

Planned security improvements:
- [ ] Add password strength requirements (minimum length, complexity)
- [ ] Implement salt-based password hashing
- [ ] Add 2FA/MFA support for superadmin
- [ ] Encrypted IndexedDB option
- [ ] Audit logging for admin actions
- [ ] Session timeout and automatic logout
- [ ] CSP headers configuration
- [ ] Regular security audits

### Out of Scope

The following are **not planned** due to the client-side architecture:
- Server-side authentication
- Database encryption
- API rate limiting
- Server-side audit logs
- DDoS protection

For these features, consider using Aither with a custom backend.

## Best Practices for Users

### For Organization Administrators

1. **Password Management:**
   - Use a unique, strong password (16+ characters)
   - Don't share your password
   - Change password if compromised
   - Don't write down passwords

2. **Device Security:**
   - Lock your device when away
   - Don't use on public/shared computers
   - Keep device OS and browser updated
   - Use full-disk encryption if available

3. **Data Management:**
   - Regularly export important QR codes
   - Don't store sensitive personal information
   - Review QR codes periodically
   - Delete unused collections

### For Superadmins

1. **Access Control:**
   - Limit who has superadmin access
   - Change default password immediately
   - Use password override feature for rotation
   - Monitor organization creation activity

2. **Deployment:**
   - Use environment variables for secrets
   - Enable HTTPS/SSL everywhere
   - Monitor access logs (if available)
   - Regular security updates

## Compliance Considerations

### Data Protection Regulations

**GDPR Compliance:**
- No personal data is sent to servers (client-side only)
- Users can delete their data (clear browser storage)
- Data portability (export QR codes)
- Right to be forgotten (clear IndexedDB)

**Limitations:**
- No audit trail of data access
- No automated data backup
- Users responsible for their own data

### Accessibility

Security features are designed to be accessible:
- Keyboard navigation supported
- Screen reader compatible
- High contrast themes available

## Contact

For security concerns or questions:

**Daniel Oceno Security Team**
Email: hello@danieloceno.com
Website: https://github.com/tinydarkforge/Aither
PGP Key: [Available on request]

---

**Document Version:** 1.0
**Last Updated:** January 1, 2025
**Next Review:** April 1, 2025

© 2025 Daniel Oceno. MIT License.
