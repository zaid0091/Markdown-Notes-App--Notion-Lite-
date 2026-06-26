import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/common/ThemeToggle';
import BrandLogo from '../components/common/BrandLogo';
import '../styles/docs.css';

export const DocsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = "Notion Lite | Documentation";
  }, []);

  // Documentation sections structure
  const docSections = [
    {
      group: 'Getting Started',
      items: [
        { id: 'intro', title: 'Introduction', keywords: 'welcome about notion lite client overview manual' },
        { id: 'quickstart', title: 'Quick Start', keywords: 'register login get started workspace interface tour' },
        { id: 'security', title: 'Security & Privacy', keywords: 'safe secure cookie credentials data privacy encryption' }
      ]
    },
    {
      group: 'Core Features',
      items: [
        { id: 'markdown', title: 'Markdown Editor', keywords: 'live editor formatting syntax slash commands bold italic heading checklist table' },
        { id: 'latex', title: 'LaTeX Formulas', keywords: 'katex equations math compiler sum fraction integral equation symbol' },
        { id: 'workspace', title: 'Workspace Page Tree', keywords: 'nested folders note hierarchy sidebar create folder document page' }
      ]
    },
    {
      group: 'Advanced Tools',
      items: [
        { id: 'tags', title: 'Tags Manager', keywords: 'hsl colors querying categories filter search tags tagging' },
        { id: 'pdf', title: 'PDF Export', keywords: 'watermark template printing page layouts download print' },
        { id: 'sync', title: 'Offline & Cloud Sync', keywords: 'background sync offline cache storage recovery autosave connection network' },
        { id: 'plans', title: 'Tiers & Subscriptions', keywords: 'pricing billing free pro organization upgrade tier' }
      ]
    }
  ];

  // Filter sections by search query
  const filteredSections = docSections.map(group => {
    const items = group.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="docs-container">
      <div className="docs-glow docs-glow-1"></div>
      <div className="docs-glow docs-glow-2"></div>

      {/* Mobile Top Header */}
      <header className="docs-mobile-header">
        <a href="#" className="docs-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <BrandLogo size={24} />
          <span>Notion Lite Docs</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button 
            className="docs-hamburger-btn" 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isMobileSidebarOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <aside className={`docs-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="docs-sidebar-header">
          <a href="#" className="docs-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <BrandLogo size={24} />
            <span>Notion Lite Docs</span>
          </a>
          
          <div className="docs-search-wrapper">
            <svg className="docs-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="docs-search-input" 
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="docs-nav-menu">
          {filteredSections.map((group, groupIdx) => (
            <div key={groupIdx} className="docs-nav-group">
              <span className="docs-group-title">{group.group}</span>
              {group.items.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`} 
                  className="docs-nav-item"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  {item.title}
                </a>
              ))}
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div style={{ padding: '0 12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No matches found for "{searchQuery}"
            </div>
          )}
        </nav>

        <div className="docs-sidebar-footer">
          <a href="#" className="docs-back-btn" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
          <div className="docs-theme-toggle-desktop" style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Documentation Panels */}
      <main className="docs-content-wrapper">
        <div className="docs-content">
          
          {/* Article: Introduction */}
          <article id="intro" className="docs-article">
            <h1>Notion Lite Overview</h1>
            <p>
              Welcome to the **Notion Lite** documentation! Notion Lite is a premium, high-performance markdown editing workspace built for creators, developers, and writers.
            </p>
            <p>
              We designed Notion Lite to combine the fluid simplicity of text editing with the structured organization of a modern workspace suite. It features seamless, real-time LaTeX parsing, nested folder page trees, customizable tagging utilities, watermarked/unwatermarked PDF generators, and an offline-first architecture.
            </p>
            <div className="docs-callout note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div>
                <strong>Quick Workspace Access</strong>: If you already have an account, click the "Go to Workspace" button on the landing page navigation bar to instantly access your notes.
              </div>
            </div>
          </article>

          {/* Article: Quick Start */}
          <article id="quickstart" className="docs-article">
            <h2>Quick Start Guide</h2>
            <p>
              Follow these simple steps to set up your personal writing profile and begin structuring your thoughts:
            </p>
            <h3>1. Create an Account</h3>
            <p>
              Click **Get Started** on the top right of the homepage. Fill in a username, a unique email address, and a secure password. Upon registration, you will be automatically redirected into your brand-new workspace.
            </p>
            <h3>2. Take a Tour of the Workspace</h3>
            <ul>
              <li><strong>Left Sidebar</strong>: Houses your hierarchical page tree, settings utilities, user profile controls, and the Tag Manager filter.</li>
              <li><strong>Note Editor Pane</strong>: Located in the center-left, this is where you write your raw Markdown text and LaTeX math formulas.</li>
              <li><strong>Live Preview Pane</strong>: Rendered on the center-right, this updates in real time to display your formatted headers, math tables, and checklists.</li>
            </ul>
            <h3>3. Write Your First Note</h3>
            <p>
              Click the **New Page** button in the sidebar. Give your page a title, and start typing. Watch the live preview update instantly as you write.
            </p>
          </article>

          {/* Article: Security & Privacy */}
          <article id="security" className="docs-article">
            <h2>Security & Privacy</h2>
            <p>
              Your thoughts and data are personal. Notion Lite implements high-standard data security and session protection measures to ensure your workspace remains secure:
            </p>
            <ul>
              <li>
                <strong>HttpOnly Session Security</strong>: We use industry-standard cookie protection. Your login credentials and authentication sessions are secured using encrypted tokens that cross-site scripting (XSS) scripts cannot access.
              </li>
              <li>
                <strong>Data Encryption</strong>: When you sync notes to the cloud, all communications are fully encrypted in transit using SSL/TLS protocols.
              </li>
              <li>
                <strong>Data Ownership</strong>: You retain absolute ownership of all notes. With our local storage caching, you can export your notes at any time.
              </li>
            </ul>
          </article>

          {/* Article: Markdown Editor */}
          <article id="markdown" className="docs-article">
            <h2>Live Markdown Editor</h2>
            <p>
              Our live workspace splits your window into a split-pane layout: a raw text editor on the left and a reactive styled preview on the right. Formats render on keypresses with sub-5ms compile times.
            </p>
            <h3>Basic Markdown Formatting Guide</h3>
            <div className="docs-showcase-box">
              <div className="showcase-header">
                <span className="showcase-dot"></span>
                <span className="showcase-dot"></span>
                <span className="showcase-dot"></span>
                <span className="showcase-title">Interactive Showcase</span>
              </div>
              <div className="showcase-grid">
                <div className="showcase-pane raw-editor">
                  # Heading 1{"\n"}
                  ## Heading 2{"\n"}
                  {"\n"}
                  - [x] Completed task{"\n"}
                  - [ ] Unfinished task{"\n"}
                  {"\n"}
                  | Col 1 | Col 2 |{"\n"}
                  | :--- | :--- |{"\n"}
                  | Value | Data |
                </div>
                <div className="showcase-pane rendered-view">
                  <h1 className="docs-md-heading h1">Heading 1</h1>
                  <h2 className="docs-md-heading h2">Heading 2</h2>
                  <ul className="docs-md-list">
                    <li><input type="checkbox" checked readOnly /> Completed task</li>
                    <li><input type="checkbox" readOnly /> Unfinished task</li>
                  </ul>
                  <table className="docs-md-table">
                    <thead>
                      <tr>
                        <th>Col 1</th>
                        <th>Col 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Value</td>
                        <td>Data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <h3>Slash Commands Menu</h3>
            <p>
              Pressing the slash key (<code className="docs-inline-formula">/</code>) triggers a floating basic blocks autocomplete menu. Use it to rapidly insert standard tags, formulas, headers, or bullet lists without keyboard strain.
            </p>
          </article>

          {/* Article: LaTeX Formulas */}
          <article id="latex" className="docs-article">
            <h2>LaTeX KaTeX Formulas</h2>
            <p>
              Notion Lite parses LaTeX mathematical notation natively using **KaTeX** for speed. It supports both inline formulas and full centered block equations.
            </p>
            <h3>Usage Syntax</h3>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Syntax Example</th>
                  <th>Output Presentation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Inline Math</strong></td>
                  <td><code style={{color: '#a1a1aa'}}>$E = mc^2$</code></td>
                  <td><span className="docs-inline-formula">E = mc²</span></td>
                </tr>
                <tr>
                  <td><strong>Block Math</strong></td>
                  <td><code style={{color: '#a1a1aa'}}>{"$$\\sum_{i=1}^n x_i$$"}</code></td>
                  <td>
                    <div style={{ textAlign: 'center', margin: '4px 0', fontFamily: 'serif', fontSize: '1.1rem' }}>
                      ∑<sub>i=1</sub><sup>n</sup> x<sub>i</sub>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="docs-callout tip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-5.464"></path>
              </svg>
              <div>
                <strong>LaTeX Tip</strong>: Make sure not to leave spaces between the dollar signs (<code className="docs-inline-formula">$</code>) and the formula contents (e.g. write <code className="docs-inline-formula">$a^2 + b^2$</code>, not <code className="docs-inline-formula">$ a^2 + b^2 $</code>) for proper compiler alignment.
              </div>
            </div>
          </article>

          {/* Article: Workspace Page Tree */}
          <article id="workspace" className="docs-article">
            <h2>Workspace Page Tree</h2>
            <p>
              All notes are managed in a hierarchical structure visible in the workspace sidebar.
            </p>
            <ul>
              <li><strong>Infinite Nesting</strong>: Create subpages inside parent notes infinitely to group projects and documents.</li>
              <li><strong>Quick Creation</strong>: Click the plus (<code className="docs-inline-formula">+</code>) icon on any note in the tree to create a nested subpage.</li>
              <li><strong>Deletion & Renaming</strong>: Manage settings directly from the hover context menus.</li>
            </ul>
          </article>

          {/* Article: Tags Manager */}
          <article id="tags" className="docs-article">
            <h2>Tags Manager</h2>
            <p>
              Organize notes horizontally across nested trees using the Workspace Tag Manager.
            </p>
            <ul>
              <li><strong>HSL Custom Colors</strong>: Assign unique Hue, Saturation, and Lightness settings to distinguish tag pills.</li>
              <li><strong>Tag Querying</strong>: Search for notes that contain specific tags or tags matching query criteria.</li>
              <li><strong>Global Filter</strong>: Filter notes lists in the workspace sidebar to focus on specific work categories.</li>
            </ul>
          </article>

          {/* Article: PDF Export */}
          <article id="pdf" className="docs-article">
            <h2>Smart PDF Export</h2>
            <p>
              Notion Lite compiles your rendered markdown page layout (including LaTeX mathematics, tables, code listings, and checkboxes) directly into a printable format using browser-native engine templates.
            </p>
            <div className="docs-callout warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>
              </svg>
              <div>
                <strong>PDF Watermark</strong>: Note PDF exports on the **Free Sandbox** tier include a Notion Lite watermark at the top and bottom of pages. To export clean, customizable notes, upgrade to the **Pro Developer** tier.
              </div>
            </div>
          </article>

          {/* Article: Offline & Cloud Sync */}
          <article id="sync" className="docs-article">
            <h2>Offline-First & Cloud Sync</h2>
            <p>
              We designed Notion Lite to ensure you never lose a single keystroke, regardless of network availability.
            </p>
            <ul>
              <li>
                <strong>Local Caching</strong>: Workspace note hierarchies and text are cached inside local browser storage. If the network goes offline, the editor switches to local mode automatically.
              </li>
              <li>
                <strong>Keystroke Save Pulses</strong>: Watch the glowing auto-save pulse in the mockup workspace. Notes save locally on every input.
              </li>
              <li>
                <strong>Background Sync</strong>: Once a connection is established, changes are synced in the background with the database server automatically.
              </li>
            </ul>
          </article>

          {/* Article: Tiers & Subscriptions */}
          <article id="plans" className="docs-article">
            <h2>Tiers & Subscriptions</h2>
            <p>
              Notion Lite scales to support separate writing needs. Here is a breakdown of our dynamic tiers:
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Plan Tier</th>
                  <th>Price</th>
                  <th>Core Focus</th>
                  <th>Cloud Sync</th>
                  <th>Clean PDF Export</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Free Sandbox</strong></td>
                  <td>$0/ mo</td>
                  <td>Local writing & math sandbox</td>
                  <td>❌ (Local Only)</td>
                  <td>❌ (Watermarked)</td>
                </tr>
                <tr>
                  <td><strong>Pro Developer</strong></td>
                  <td>$8/ mo</td>
                  <td>Real-time synchronization</td>
                  <td>✅ Infinite cloud sync</td>
                  <td>✅ Clean exports</td>
                </tr>
                <tr>
                  <td><strong>Organization</strong></td>
                  <td>$19/ mo</td>
                  <td>Collaborative editing & workspaces</td>
                  <td>✅ Real-time CRDTs</td>
                  <td>✅ Custom templates</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '10px' }}>
              To test the plan upgrades, scroll to the pricing section on the home page and click the corresponding subscription button to simulate upgrading your account.
            </p>
          </article>

        </div>
      </main>
    </div>
  );
};

export default DocsPage;
