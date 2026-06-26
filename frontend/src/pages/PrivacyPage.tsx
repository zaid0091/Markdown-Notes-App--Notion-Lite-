import React, { useEffect } from 'react';
import Navbar from '../components/common/Navbar';

export const PrivacyPage: React.FC = () => {

  useEffect(() => {
    document.title = "Notion Lite | Privacy Policy";
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      paddingBottom: '80px'
    }}>
      {/* Top Navbar Header */}
      <Navbar />

      {/* Main Content Container */}
      <main style={{
        maxWidth: '800px',
        margin: '60px auto 0 auto',
        padding: '0 24px',
        lineHeight: '1.7',
        animation: 'fadeIn 0.4s ease'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          marginBottom: '8px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>Privacy Policy</h1>
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginBottom: '40px'
        }}>Last updated: June 26, 2026</p>

        <div style={{
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          {/* Section 1 */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-color)' }}>1.</span> Information We Collect
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We collect information to provide a better, more secure markdown note-taking workspace:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Account Credentials:</strong> Username, email address, and encrypted passwords. Your email is used as your primary login identifier.</li>
              <li><strong>Workspace Content:</strong> The markdown notes, documents, and tags you create inside your hierarchy.</li>
              <li><strong>Profile Metadata:</strong> Custom profile pictures and workspace subscription settings.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-color)' }}>2.</span> Data Storage and Security
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We take the security of your notes and credentials very seriously:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Secure Tokens:</strong> We secure your login session using HttpOnly JWT cookies to prevent cross-site scripting (XSS) extraction attacks.</li>
              <li><strong>Encrypted Transport:</strong> All communication between the frontend and Django API layers is encrypted using Transport Layer Security (TLS).</li>
              <li><strong>Database Protection:</strong> Your password is salted and hashed securely using standard PBKDF2 hashing algorithms before saving.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-color)' }}>3.</span> Cookies and Local Storage
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We use lightweight cookies and local storage tokens to preserve application preferences:
            </p>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Appearance settings:</strong> Dark mode and light mode selections are saved on your local device to prevent interface flicker on page reload.</li>
              <li><strong>Subscription settings:</strong> Pricing selections (e.g. Pro Developer subscription plan) are cached in browser local storage.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-color)' }}>4.</span> Your Rights and Data Deletion
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              You retain complete ownership over your notes and personal data. You have the right to request access to, edit, or permanently erase your account details, uploaded profile images, and notes workspace. Deleted items are permanently removed from our active databases.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent-color)' }}>5.</span> Contact Us
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              If you have any questions regarding this privacy policy or your notes database, feel free to contact us at <a href="mailto:privacy@notionlite.com" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>privacy@notionlite.com</a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
