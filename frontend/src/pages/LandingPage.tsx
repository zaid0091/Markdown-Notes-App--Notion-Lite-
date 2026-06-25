import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';
import PreviewPane from '../components/editor/PreviewPane';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Set landing page document title on mount
  useEffect(() => {
    document.title = "Notion Lite | Next-Gen Markdown Workspace";
  }, []);

  // Sandbox demo text
  const [sandboxText, setSandboxText] = useState(
`# Welcome to Notion Lite! 👋

Notion Lite is a high-fidelity markdown editor designed for speed and clarity. 

Type here to try the editor live:

## Dynamic Features:
- [x] Hierarchical nested folders
- [x] Slash command menu blocks
- [x] Custom tag presets
- [ ] Export to formatted PDF

## Mathematics & Equations:
Render math blocks in real-time using KaTeX:

$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$

## Code Syntax Highlighting:
\`\`\`javascript
const notionLite = {
  speed: "0ms latency",
  security: "httpOnly JWT",
  aesthetic: "glassmorphism"
};
\`\`\`
`
  );

  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-glow landing-glow-1"></div>
      <div className="landing-glow landing-glow-2"></div>

      {/* Header Navigation */}
      <header className="landing-nav">
        <a href="#" className="landing-logo">
          <div className="landing-logo-icon">N</div>
          <span>Notion Lite</span>
        </a>
        
        <div className="landing-nav-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => navigate('/workspace')}>
              Go to Workspace
            </button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge animate-pop-in">
          <span className="landing-badge-pulse"></span>
          <span>Introducing Notion Lite 1.0</span>
        </div>
        
        <h1 className="landing-title animate-slide-up">
          Your thoughts, structured. <span>Fast, simple, secure.</span>
        </h1>
        
        <p className="landing-subtitle animate-slide-up">
          A premium, glassmorphic markdown canvas engineered for developers and writers. Features hierarchical page trees, slash formatting commands, live LaTeX compilers, tags manager, and offline-ready PDF exports.
        </p>

        <div className="landing-ctas animate-slide-up">
          <button className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
            {isAuthenticated ? 'Open Workspace' : 'Get Started for Free'}
          </button>
          <a href="#demo" className="btn btn-secondary">
            Try Sandbox Demo
          </a>
        </div>

        {/* CSS-designed Dashboard Mockup */}
        <div className="landing-mockup-wrapper animate-slide-up">
          <div className="landing-mockup">
            {/* Sidebar Mockup */}
            <div className="mockup-sidebar">
              <div className="mockup-user-info">
                <div className="mockup-avatar">NL</div>
                <span>Workspace Hub</span>
              </div>
              <div className="mockup-tree-section">
                <div className="mockup-tree-title">Private Pages</div>
                <div className="mockup-node active">
                  <span>🏠</span> Home Dashboard
                </div>
                <div className="mockup-node mockup-node-indent">
                  <span>📝</span> Project Roadmap
                </div>
                <div className="mockup-node mockup-node-indent">
                  <span>📊</span> Budget Specifications
                </div>
                <div className="mockup-node">
                  <span>💡</span> Ideas Sandbox
                </div>
                <div className="mockup-node">
                  <span>🏷️</span> Tags Manager
                </div>
              </div>
            </div>

            {/* Editor Canvas Mockup */}
            <div className="mockup-main">
              <div className="mockup-header">
                <span>🏠 Home Dashboard</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                  ● Auto-saved
                </span>
              </div>
              <div className="mockup-content">
                <div className="mockup-editor">
                  <span style={{ color: 'var(--text-muted)' }}># Home Dashboard</span>
                  <br />
                  <span>Welcome back! </span>
                  <span>This is a live mockup.</span>
                  <br />
                  <span>- [x] Check backend connections</span>
                  <span>- [ ] Review documentation specs</span>
                  <br />
                  <span style={{ color: 'var(--accent-color)' }}>/list_commands</span>
                  <div style={{
                    padding: '8px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    fontSize: '0.75rem'
                  }}>
                    <div>📝 Text</div>
                    <div style={{ color: 'var(--accent-color)' }}> Heading 1</div>
                    <div> Heading 2</div>
                  </div>
                </div>
                <div className="mockup-preview">
                  <h1 style={{ marginTop: 0, fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Home Dashboard</h1>
                  <p>Welcome back! This is a live mockup.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked readOnly /> Check backend connections
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" disabled readOnly /> Review documentation specs
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-features-section">
        <h2 className="section-title">Everything you need, built in.</h2>
        <p className="section-subtitle">We parsed the complexity of modern document editors into a fast, single-file compiler workspace.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">📁</div>
            <h3>Recursive Page Tree</h3>
            <p>Nests pages infinitely under one another. Organize your research, scripts, and logs using our custom cascading sidebar explorer.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">⌨️</div>
            <h3>Slash command blocks</h3>
            <p>Type `/` inside the editor textarea to open the blocks command palette. Instantly insert quotes, code sections, headers, and checkboxes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">📐</div>
            <h3>LaTeX Math Rendering</h3>
            <p>Write equations using LaTeX syntax. Real-time math renders seamlessly in the split preview pane with zero lag.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">🔍</div>
            <h3>Omnibar Search Palette</h3>
            <p>Hit <code>Ctrl+K</code> or <code>Cmd+K</code> from anywhere in the app to search titles and contents instantly, highlighting matches dynamically.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">🏷️</div>
            <h3>Custom Workspace Tags</h3>
            <p>Create workspace-wide tags with custom HSL color presets. Map tags onto notes to filter your workspace in milliseconds.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">📄</div>
            <h3>Fallback PDF Exports</h3>
            <p>Compile and stream notes instantly into highly readable, clean, printing-ready PDF attachments directly from the browser.</p>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Playground */}
      <section id="demo" className="landing-playground-section">
        <h2 className="section-title">Try it in the sandbox</h2>
        <p className="section-subtitle">Write standard markdown or KaTeX formulas below to test our compiler in real time.</p>
        
        <div className="playground-container">
          <div className="playground-header">
            <div className="playground-title-bar">
              <div className="playground-dots">
                <div className="playground-dot red"></div>
                <div className="playground-dot yellow"></div>
                <div className="playground-dot green"></div>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>sandbox_draft.md</span>
            </div>
            <div className="playground-badge">Live Preview</div>
          </div>
          
          <div className="playground-workspace">
            <div className="playground-editor-pane">
              <div className="playground-pane-title">Editor Input</div>
              <textarea
                className="playground-textarea"
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                placeholder="Type your markdown here..."
              />
            </div>
            <div className="playground-preview-pane">
              <div className="playground-pane-title">Compiled output</div>
              <div className="playground-preview-scroll">
                <PreviewPane content={sandboxText} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Conversion Banner */}
      <section className="landing-cta-banner">
        <h2>Start structuring your thoughts today.</h2>
        <p>Sign up now to save nested folders, covers, tags, and run queries instantly across your entire workspace.</p>
        <button className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
          {isAuthenticated ? 'Open Your Workspace' : 'Get Started Free'}
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="landing-logo-icon" style={{ width: '24px', height: '24px', fontSize: '0.85rem' }}>N</div>
          <span>Notion Lite</span>
        </div>
        <div>
          <span>&copy; {new Date().getFullYear()} Notion Lite. All rights reserved.</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Documentation</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
