# Use Python 3.9 as base image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories if they don't exist
RUN mkdir -p static/data

# Expose port 5001 (the port your app uses)
EXPOSE 5001

# Command to run the application
CMD ["python", "app.py"]