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

  // Mockup pages content
  const mockupPages = [
    {
      id: 'home',
      title: 'Home Dashboard',
      icon: '🏠',
      editorContent: `# 🏠 Home Dashboard\n\nWelcome back to your workspace! Notion Lite compiles your markdown with zero latency.\n\n## Next Tasks:\n- [x] Integrate KaTeX math compiler\n- [x] Implement glassmorphism theme components\n- [ ] Set up production database backup\n\nType \`/\` anywhere in the editor to see formatting commands.`
    },
    {
      id: 'roadmap',
      title: 'Project Roadmap',
      icon: '📝',
      editorContent: `# 📝 Project Roadmap\n\nOverview of the next core release milestones for Notion Lite.\n\n| Phase | Milestone | Status |\n| :--- | :--- | :--- |\n| **V1.0** | Core Editor Launch | Complete |\n| **V1.1** | Real-time Collaboration | In Progress |\n| **V2.0** | AI Writing Assistant | Planned |\n\n*Update: The rendering engine now compiles remarks in <5ms.*`
    },
    {
      id: 'budget',
      title: 'Budget Specifications',
      icon: '📊',
      editorContent: `# 📊 Budget Specifications\n\nQ3 project allocation calculations.\n\n## Mathematical Formulation:\nLet the total monthly budget $B_m$ be represented as:\n\n$$B_m = \\sum_{i=1}^{n} (c_i + o_i)$$\n\nWhere:\n- $c_i$ represents developer cost per department $i$.\n- $o_i$ represents operations & hosting overhead per department $i$.`
    },
    {
      id: 'tags',
      title: 'Tags Manager',
      icon: '🏷️',
      editorContent: `# 🏷️ Tags Manager\n\nTags help you organize and query notes instantly.\n\n## Current Workspace Tags:\n- \`Feature\` (HSL 265, 80%, 60%) — Used for roadmap milestones.\n- \`High Priority\` (HSL 0, 80%, 60%) — Critical blocker notes.\n- \`Docs\` (HSL 190, 80%, 50%) — Reference manuals.\n\n*Tip: Filter notes by clicking on any tag pill in the sidebar.*`
    }
  ];

  const [activeMockupIndex, setActiveMockupIndex] = useState(0);

  // Sandbox presets
  const sandboxPresets = [
    {
      name: '📐 Euler\'s Identity',
      content: `# Euler's Identity 📐\n\nEuler's identity is an equation in mathematics, considered to be an exemplar of mathematical beauty:\n\n$$e^{i\\pi} + 1 = 0$$\n\nWhere:\n- $e$ is Euler's number (base of natural logarithms)\n- $i$ is the imaginary unit ($i^2 = -1$)\n- $\\pi$ is the ratio of circle circumference to diameter`
    },
    {
      name: '💻 TypeScript Showcase',
      content: `# Code Syntax Highlighting 💻\n\nHere is a modern TypeScript function demonstrating clean async operations:\n\n\`\`\`typescript\ninterface Note {\n  id: string;\n  title: string;\n  content: string;\n}\n\nasync function fetchNote(noteId: string): Promise<Note> {\n  const response = await fetch(\`/api/notes/\${noteId}\`);\n  if (!response.ok) {\n    throw new Error(\`Failed to fetch note: \${response.statusText}\`);\n  }\n  return response.json();\n}\n\`\`\``
    },
    {
      name: '🚀 Tasks & Roadmap',
      content: `# Feature Checklist & Roadmap 🚀\n\nTrack your progress visually with markdown tables and checkboxes.\n\n## Current Launch Status\n- [x] Design glassmorphic dashboard\n- [x] Configure KaTeX mathematical rendering\n- [x] Establish hierarchical page tree routing\n- [ ] Add real-time multi-device cloud sync\n- [ ] Support offline local storage backup\n\n## Q3 Deliverables\n| Deliverable | Priority | ETA | Assignee |\n| :--- | :--- | :--- | :--- |\n| PDF Export | High | July 15 | @dev_crew |\n| Search Index | Medium | July 30 | @search_guy |\n| Tag Querying | Low | Aug 10 | @front_end |`
    }
  ];

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

  // Active feature tab state
  const [activeFeatureTab, setActiveFeatureTab] = useState('nested');

  const featureTabs = [
    {
      id: 'nested',
      title: 'Nested Workspace',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      description: 'Nest folders and notes infinitely. Organize project briefs, design guidelines, and code snippets in an intuitive hierarchical structure.',
      visualDemo: (
        <div className="tab-demo-tree">
          <div className="demo-tree-node parent">
            <span className="arrow-down">▼</span> 📁 <span>Q3 Project Alpha</span>
          </div>
          <div className="demo-tree-node child indent-1">
            <span className="arrow-down">▼</span> 📁 <span>Engineering</span>
          </div>
          <div className="demo-tree-node child indent-2 active">
            📝 <span className="highlight-text">Database Schema.md</span>
          </div>
          <div className="demo-tree-node child indent-2">
            📝 <span>API Endpoints.md</span>
          </div>
          <div className="demo-tree-node child indent-1">
            📁 <span>Marketing & Launch</span>
          </div>
        </div>
      )
    },
    {
      id: 'slash',
      title: 'Slash Commands',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
          <line x1="6" y1="8" x2="6" y2="8" />
          <line x1="10" y1="8" x2="10" y2="8" />
          <line x1="14" y1="8" x2="14" y2="8" />
          <line x1="18" y1="8" x2="18" y2="8" />
          <line x1="6" y1="12" x2="6" y2="12" />
          <line x1="10" y1="12" x2="14" y2="12" />
          <line x1="18" y1="12" x2="18" y2="12" />
          <line x1="6" y1="16" x2="18" y2="16" />
        </svg>
      ),
      description: 'Accelerate formatting by typing "/" to trigger an in-editor popup menu. Instantly generate codeblocks, headings, math elements, and lists.',
      visualDemo: (
        <div className="tab-demo-slash">
          <div className="demo-slash-input">
            <span>Welcome to Notion Lite! /</span><span className="cursor-pulse">|</span>
          </div>
          <div className="demo-slash-menu">
            <div className="menu-header">Basic Blocks</div>
            <div className="menu-item active">
              <span className="menu-item-icon">📝</span>
              <div className="menu-item-text">
                <span className="title">Text</span>
                <span className="desc">Start writing with plain text</span>
              </div>
            </div>
            <div className="menu-item">
              <span className="menu-item-icon" style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>H1</span>
              <div className="menu-item-text">
                <span className="title">Heading 1</span>
                <span className="desc">Large section heading</span>
              </div>
            </div>
            <div className="menu-item">
              <span className="menu-item-icon">📐</span>
              <div className="menu-item-text">
                <span className="title">Math Equation</span>
                <span className="desc">Inline KaTeX formula</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'katex',
      title: 'LaTeX Math',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
      ),
      description: 'Write formulas using standard LaTeX. Our real-time KaTeX integration renders mathematical expressions in the preview with sub-millisecond compile times.',
      visualDemo: (
        <div className="tab-demo-katex">
          <div className="katex-source">
            <span className="code-color-pink">$$\sum_</span>
            <span className="code-color-blue">&#123;n=1&#125;</span>
            <span className="code-color-pink">^\infty \frac&#123;1&#125;&#123;n^2&#125;$$</span>
          </div>
          <div className="katex-arrow">↓ Renders as</div>
          <div className="katex-compiled">
            <span style={{ fontFamily: 'Times New Roman, serif', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 600 }}>
              ∑<sub>n=1</sub><sup>∞</sup> <sup>1</sup>/<sub>n<sup>2</sup></sub>
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'omnibar',
      title: 'Omnibar Search',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      description: 'Hit Ctrl+K or Cmd+K to launch the navigation dashboard. Search node names, tags, and document content instantly with dynamic highlight matching.',
      visualDemo: (
        <div className="tab-demo-omnibar">
          <div className="demo-search-bar">
            <span>🔍 search: </span>
            <span className="search-query highlight-pulse">Roadmap</span>
          </div>
          <div className="demo-search-results">
            <div className="search-result-item active">
              <span className="result-icon">📝</span>
              <div className="result-details">
                <span className="result-title">Project <span className="highlight-match">Roadmap</span>.md</span>
                <span className="result-snippet">...Overview of the next core release milestones...</span>
              </div>
            </div>
            <div className="search-result-item">
              <span className="result-icon">🏠</span>
              <div className="result-details">
                <span className="result-title">Home Dashboard.md</span>
                <span className="result-snippet">...Review documentation specifications and <span className="highlight-match">roadmap</span>...</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tags',
      title: 'Tags Manager',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7" y2="7" />
        </svg>
      ),
      description: 'Categorize your workspace. Assign custom HSL color-presets to tags and filter notes dynamically in milliseconds via the Sidebar explorer.',
      visualDemo: (
        <div className="tab-demo-tags">
          <div className="tags-list">
            <span className="tag-badge color-purple">Feature</span>
            <span className="tag-badge color-red">High Priority</span>
            <span className="tag-badge color-blue">Docs</span>
          </div>
          <div className="tags-creator">
            <div className="creator-input">
              <span>Tag Title:</span>
              <input type="text" value="Ideas" disabled />
            </div>
            <div className="color-presets">
              <span className="color-dot purple active"></span>
              <span className="color-dot red"></span>
              <span className="color-dot blue"></span>
              <span className="color-dot green"></span>
            </div>
            <span className="tag-preview-badge">Ideas</span>
          </div>
        </div>
      )
    },
    {
      id: 'pdf',
      title: 'Smart PDF Export',
      icon: (
        <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      description: 'Stream clean, printable page templates right in the client. Print or export beautiful, formatted PDFs offline with one click.',
      visualDemo: (
        <div className="tab-demo-pdf">
          <div className="pdf-page-mockup">
            <div className="pdf-header-bar">
              <span className="pdf-logo">Notion Lite PDF Compiler</span>
              <span className="pdf-page-num">Page 1 of 1</span>
            </div>
            <div className="pdf-body-lines">
              <div className="line-h1"></div>
              <div className="line-p"></div>
              <div className="line-p"></div>
              <div className="line-table"></div>
            </div>
          </div>
          <button className="pdf-download-btn active">
            <span>📥 Exporting PDF...</span>
            <div className="progress-bar-fill"></div>
          </button>
        </div>
      )
    }
  ];

  // FAQ accordion state
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const faqData = [
    {
      question: 'Is my data secure in Notion Lite?',
      answer: 'Absolutely. Notion Lite uses industry-standard httpOnly JWT cookies for session security, meaning your session token cannot be read by cross-site scripting (XSS) attacks. When cloud sync is active, your notes are encrypted during transit and at rest.'
    },
    {
      question: 'Does it support offline editing?',
      answer: 'Yes. Notion Lite is built with an offline-first architecture. It caches your active page tree and files locally in browser memory so you can keep typing even if you lose your internet connection. Once back online, it syncs differences automatically.'
    },
    {
      question: 'How does the PDF export work?',
      answer: 'PDF export compiles your active markdown and LaTeX equations directly into a printable CSS template within the browser. You can save, print, or share notes instantly without needing external renderers or server-side engines.'
    },
    {
      question: 'Is it fully compliant with standard Markdown?',
      answer: 'Yes, we compile notes using GitHub Flavored Markdown (GFM) specs, meaning all tables, task lists, code blocks, and links behave exactly as you expect on platforms like GitHub.'
    }
  ];

  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-glow landing-glow-1"></div>
      <div className="landing-glow landing-glow-2"></div>
      <div className="landing-glow landing-glow-3"></div>

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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          ) : (
            <>
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
          Your thoughts, structured. <span>Fast. Simple. Secure.</span>
        </h1>
        
        <p className="landing-subtitle animate-slide-up">
          A premium, glassmorphic markdown canvas engineered for developers and writers. Features hierarchical page trees, slash formatting commands, live LaTeX compilers, tags manager, and offline-ready PDF exports.
        </p>

        <div className="landing-ctas animate-slide-up">
          <button className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
            {isAuthenticated ? 'Open Workspace' : 'Get Started for Free'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
                {mockupPages.map((page, index) => (
                  <div 
                    key={page.id} 
                    className={`mockup-node ${activeMockupIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveMockupIndex(index)}
                  >
                    <span>{page.icon}</span> {page.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Canvas Mockup */}
            <div className="mockup-main">
              <div className="mockup-header">
                <span>{mockupPages[activeMockupIndex].icon} {mockupPages[activeMockupIndex].title}</span>
                <span className="mockup-save-indicator">
                  <span className="save-pulse"></span>
                  Auto-saved
                </span>
              </div>
              <div className="mockup-content">
                <div className="mockup-editor">
                  <textarea 
                    className="mockup-textarea" 
                    value={mockupPages[activeMockupIndex].editorContent} 
                    readOnly 
                  />
                </div>
                <div className="mockup-preview">
                  <div className="mockup-preview-scroll">
                    <PreviewPane content={mockupPages[activeMockupIndex].editorContent} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Exploration Tabs Section */}
      <section className="landing-tabs-section">
        <div className="section-header">
          <h2 className="section-title">Everything you need, built in.</h2>
          <p className="section-subtitle">We parsed the complexity of modern document editors into a fast, single-file compiler workspace.</p>
        </div>

        <div className="tabs-container">
          <div className="tabs-list-wrapper">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-toggle-btn ${activeFeatureTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFeatureTab(tab.id)}
              >
                <div className="tab-toggle-header">
                  {tab.icon}
                  <h3>{tab.title}</h3>
                </div>
                <p>{tab.description}</p>
              </button>
            ))}
          </div>

          <div className="tab-preview-display">
            <div className="preview-display-window">
              <div className="window-header">
                <div className="window-dots">
                  <div className="window-dot red"></div>
                  <div className="window-dot yellow"></div>
                  <div className="window-dot green"></div>
                </div>
                <span className="window-title">{featureTabs.find(t => t.id === activeFeatureTab)?.title} Visualizer</span>
              </div>
              <div className="window-body">
                {featureTabs.find(t => t.id === activeFeatureTab)?.visualDemo}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Playground */}
      <section id="demo" className="landing-playground-section">
        <div className="playground-glow"></div>
        <h2 className="section-title">Try it in the sandbox</h2>
        <p className="section-subtitle">Write standard markdown or KaTeX formulas below to test our compiler in real time.</p>
        
        {/* Preset Selection Row */}
        <div className="preset-selector-row">
          <span className="preset-label">Templates:</span>
          {sandboxPresets.map((preset) => (
            <button 
              key={preset.name}
              className="preset-btn"
              onClick={() => setSandboxText(preset.content)}
            >
              {preset.name}
            </button>
          ))}
        </div>

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

      {/* Client Testimonials Section */}
      <section className="landing-testimonials-section">
        <h2 className="section-title">Loved by developers and writers.</h2>
        <p className="section-subtitle">Here is what developers, scientists, and content creators say about Notion Lite.</p>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "Notion Lite has replaced my bloated note-taking apps. The markdown compiler runs at 0ms latency, and the KaTeX integration is perfect for formulating my algorithms."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar sarah">SJ</div>
              <div className="author-details">
                <span className="name">Sarah Jenkins</span>
                <span className="role">Lead Engineer at Vercel</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "The slash commands make writing documentation twice as fast. The UI is clean, glassmorphic, and lets me focus completely on the prose."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar david">DC</div>
              <div className="author-details">
                <span className="name">David Chen</span>
                <span className="role">Technical Writer at Stripe</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">
              "I use it to draft my physics lecture notes. The LaTeX support is seamless, and exporting to printing-ready PDF takes just one click."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar elena">ER</div>
              <div className="author-details">
                <span className="name">Elena Rostova</span>
                <span className="role">CS Professor at MIT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-pricing-section">
        <h2 className="section-title">Simple, transparent plans.</h2>
        <p className="section-subtitle">Start organizing for free, upgrade as your team grow.</p>
        
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free Sandbox</h3>
              <div className="price">$0<span>/ month</span></div>
              <p>Perfect for trying out Notion Lite and local writing.</p>
            </div>
            <ul className="pricing-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Live Markdown Editor
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                LaTeX KaTeX formulas
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Local browser storage
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Export to PDF (Watermarked)
              </li>
            </ul>
            <button className="btn btn-secondary w-full" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
              Get Started
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="featured-badge">RECOMMENDED</div>
            <div className="pricing-header">
              <h3>Pro Developer</h3>
              <div className="price">$8<span>/ month</span></div>
              <p>For developers and power writers who need synchronization.</p>
            </div>
            <ul className="pricing-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Everything in Free
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Infinite Nested Pages
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Workspace Tag Manager
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Real-time Cloud Sync
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Secure httpOnly JWT auth
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                No PDF watermarks
              </li>
            </ul>
            <button className="btn btn-primary w-full" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
              Upgrade to Pro
            </button>
          </div>

          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Organization</h3>
              <div className="price">$19<span>/ user / mo</span></div>
              <p>For high-performing teams collaborating on docs.</p>
            </div>
            <ul className="pricing-features">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Everything in Pro
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Collaborative Editing (CRDTs)
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Shared Team Workspaces
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                SSO & Admin Console
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Unlimited Version History
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                99.9% Uptime SLA
              </li>
            </ul>
            <button className="btn btn-secondary w-full" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="landing-faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Quick answers to common inquiries about Notion Lite's setup and features.</p>
        
        <div className="faq-accordion">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFAQIndex === index ? 'open' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <button className="faq-question">
                <span>{faq.question}</span>
                <span className="faq-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Conversion Banner */}
      <section className="landing-cta-banner">
        <h2>Start structuring your thoughts today.</h2>
        <p>Sign up now to save nested folders, covers, tags, and run queries instantly across your entire workspace.</p>
        <button className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/workspace' : '/register')}>
          {isAuthenticated ? 'Open Your Workspace' : 'Get Started Free'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
