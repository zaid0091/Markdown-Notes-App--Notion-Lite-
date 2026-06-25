import io
import markdown
import logging
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

# Try to import WeasyPrint, set availability flag
try:
    import weasyprint
    WEASYPRINT_AVAILABLE = True
except Exception as e:
    logger.warning(f"WeasyPrint could not be imported (likely missing GTK3 runtime): {e}. Falling back to xhtml2pdf.")
    WEASYPRINT_AVAILABLE = False


def compile_markdown_to_html(page, use_weasyprint=WEASYPRINT_AVAILABLE):
    """
    Parses note markdown content into styled HTML structure,
    injecting emojis, cover banners, metadata, and CSS.
    """
    # Parse Markdown content using standard extensions
    parsed_content_html = markdown.markdown(
        page.content,
        extensions=['extra', 'codehilite', 'toc', 'tables', 'fenced_code']
    )
    
    # Get associated tags
    tags = page.tags.all()
    
    if use_weasyprint:
        page_style = """
            @page {
                size: A4;
                margin: 20mm;
                @bottom-right {
                    content: counter(page);
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    font-size: 8pt;
                    color: #a0a0a0;
                }
            }
        """
    else:
        page_style = """
            @page {
                size: A4;
                margin: 20mm;
            }
        """

    # Render full HTML template string
    html_context = {
        'title': page.title or "Untitled",
        'content': parsed_content_html,
        'icon': page.icon,
        'cover_image_url': page.cover_image.path if page.cover_image else None,
        'tags': tags,
        'created_at': page.created_at.strftime("%B %d, %Y at %I:%M %p"),
        'updated_at': page.updated_at.strftime("%B %d, %Y at %I:%M %p"),
        'username': page.user.username,
        'page_style': page_style
    }
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{{ title }}</title>
        <style>
            {{ page_style|safe }}
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #2b2b2b;
                line-height: 1.6;
                font-size: 10.5pt;
            }
            .cover-container {
                width: 100%;
                height: 150px;
                overflow: hidden;
                margin-bottom: 20px;
                border-radius: 6px;
            }
            .cover-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .icon-header {
                font-size: 32pt;
                margin-bottom: 10px;
            }
            h1 {
                font-size: 26pt;
                margin: 0 0 10px 0;
                color: #1a1a1a;
                font-weight: 700;
            }
            .meta-block {
                font-size: 8.5pt;
                color: #707070;
                margin-bottom: 25px;
                border-bottom: 1px solid #e5e5e5;
                padding-bottom: 12px;
            }
            .tag-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 7.5pt;
                font-weight: 600;
                margin-right: 5px;
                color: #ffffff;
            }
            .content-body {
                margin-top: 20px;
            }
            pre {
                background-color: #f7f7f7;
                border: 1px solid #e8e8e8;
                padding: 12px 16px;
                border-radius: 6px;
                overflow-x: auto;
                font-family: 'Courier New', Courier, monospace;
                font-size: 9pt;
                margin-bottom: 15px;
            }
            code {
                font-family: 'Courier New', Courier, monospace;
                background-color: #f7f7f7;
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 9pt;
            }
            pre code {
                background-color: transparent;
                padding: 0;
            }
            blockquote {
                border-left: 3.5px solid #d4d4d4;
                padding-left: 15px;
                margin: 15px 0;
                color: #555555;
                font-style: italic;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
                font-size: 9.5pt;
            }
            th, td {
                border: 1px solid #e0e0e0;
                padding: 8px 12px;
                text-align: left;
            }
            th {
                background-color: #f5f5f5;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        {% if cover_image_url %}
        <div class="cover-container">
            <img class="cover-image" src="{{ cover_image_url }}" alt="Cover">
        </div>
        {% endif %}
        
        {% if icon %}
        <div class="icon-header">{{ icon }}</div>
        {% endif %}
        
        <h1>{{ title }}</h1>
        
        <div class="meta-block">
            Created by <strong>{{ username }}</strong> on {{ created_at }}
            {% if tags %}
            <div style="margin-top: 8px;">
                {% for tag in tags %}
                <span class="tag-badge" style="background-color: {{ tag.color }};">{{ tag.name }}</span>
                {% endfor %}
            </div>
            {% endif %}
        </div>
        
        <div class="content-body">
            {{ content|safe }}
        </div>
    </body>
    </html>
    """
    
    # We use Django template rendering to render the inline context
    from django.template import Template, Context
    template = Template(html_template)
    context = Context(html_context)
    return template.render(context)


def generate_pdf(page):
    """
    Generates a PDF byte stream from a Page note.
    Uses WeasyPrint if available; falls back to xhtml2pdf.
    """
    if WEASYPRINT_AVAILABLE:
        try:
            logger.info("Generating PDF using WeasyPrint.")
            html_content = compile_markdown_to_html(page, use_weasyprint=True)
            pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
            return pdf_bytes
        except Exception as e:
            logger.error(f"WeasyPrint PDF generation failed: {e}. Falling back to xhtml2pdf.")
            # Fall through to xhtml2pdf
            
    # Fallback to xhtml2pdf (Pure Python, compatible with all Windows installations)
    logger.info("Generating PDF using xhtml2pdf fallback.")
    html_content = compile_markdown_to_html(page, use_weasyprint=False)
    pdf_buffer = io.BytesIO()
    from xhtml2pdf import pisa
    
    pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)
    
    if pisa_status.err:
        raise RuntimeError(f"xhtml2pdf generation failed with error code: {pisa_status.err}")
        
    return pdf_buffer.getvalue()
