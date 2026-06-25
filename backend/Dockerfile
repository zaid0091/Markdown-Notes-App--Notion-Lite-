FROM python:3.11-slim

# Install system dependencies, PostgreSQL client libraries, and GTK3/Pango/Cairo dependencies for WeasyPrint
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    python3-dev \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz-gobject0 \
    libgdk-pixbuf-2.0-0 \
    shared-mime-info \
    mime-support \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# We copy requirements.txt and install packages first to cache layers
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

EXPOSE 8000

# Default development execution command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
