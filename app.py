from flask import Flask, request, render_template, jsonify
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
from controller import Controller
import onetimescript
from db import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///domains.db'
db.init_app(app)
with app.app_context():
    db.create_all() 

controller = Controller()


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        url = request.form.get('url')
        if url:
            result = controller.main(url)
            output = {
                'status': 'SUCCESS',
                'url': url,
                'trust_score': result.get('trust_score', 0),
                'age': result.get('age', 'Unknown'),
                'rank': result.get('rank', 'Unknown'),
                'response_status': result.get('response_status', False),
                'ip': result.get('ip', 'Unknown'),
                'is_url_shortened': result.get('is_url_shortened', 0),
                'hsts_support': result.get('hsts_support', 0),
                'ip_present': result.get('ip_present', 0),
                'url_redirects': result.get('url_redirects', 0),
                'too_long_url': result.get('too_long_url', 0),
                'too_deep_url': result.get('too_deep_url', 0),
                'ssl': result.get('ssl', 0),
                'whois': result.get('whois', {})
            }
            return render_template('index.html', output=output)
    return render_template('index.html')


@app.route('/api/check-url', methods=['POST'])
def check_url_api():
    try:
        url = request.form.get('url')
        if not url:
            return jsonify({
                'status': 'ERROR',
                'message': 'URL parameter is required'
            }), 400
            
        result = controller.main(url)
        
        # Extract only the necessary data for the extension
        # Ensure all values are properly typed
        trust_score = result.get('trust_score', 0)
        # Convert trust_score to int if it's not already
        if not isinstance(trust_score, int):
            try:
                trust_score = int(trust_score)
            except (ValueError, TypeError):
                trust_score = 0
                
        response_data = {
            'status': result.get('status', 'ERROR'),
            'url': result.get('url', url),
            'trust_score': trust_score,
            'is_safe': trust_score >= 50,
            'domain_age': str(result.get('age', 'Unknown')),
            'domain_rank': str(result.get('rank', 'Unknown')),
            'ip_present': bool(result.get('ip_present', False)),
            'is_url_shortened': bool(result.get('is_url_shortened', False)),
            'hsts_support': bool(result.get('hsts_support', False)),
            'too_long_url': bool(result.get('too_long_url', False)),
            'too_deep_url': bool(result.get('too_deep_url', False))
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"API Error: {str(e)}")
        return jsonify({
            'status': 'ERROR',
            'message': str(e),
            'url': request.form.get('url', '')
        }), 500


@app.route('/preview', methods=['POST'])
def preview():
    try:
        url = request.form.get('url')
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # inject external resources into HTML
        for link in soup.find_all('link'):
            if link.get('href'):
                link['href'] = urljoin(url, link['href'])
        
        # Uncomment this if you want to enable script
        # for script in soup.find_all('script'):
        #     if script.get('src'):
        #         script['src'] = urljoin(url, script['src'])

        for img in soup.find_all('img'):
            if img.get('src'):
                img['src'] = urljoin(url, img['src'])

        return render_template('preview.html', content=soup.prettify())
    except Exception as e:
        return  f"Error: {e}"


@app.route('/source-code', methods=['GET','POST'])
def view_source_code():

    try:
        url = request.form.get('url')
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        formatted_html = soup.prettify()
        
        return render_template('source_code.html', formatted_html = formatted_html, url = url)
    
    except Exception as e:
        return  f"Error: {e}"

@app.route('/update-db')
def update_db(): 
    try:
        with app.app_context():
            response = onetimescript.update_db()
            print("Database populated successfully!")
            return response, 200
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return "An error occurred: " + str(e), 500

@app.route('/update-json')
def update_json(): 
    try:
        with app.app_context():
            response = onetimescript.update_json()
            print("JSON updated successfully!")
            return response, 200
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return "An error occurred: " + str(e), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)