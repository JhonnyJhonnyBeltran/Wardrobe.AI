"""
Background Removal API using rembg
Run: python bg_removal_server.py
"""

from flask import Flask, request, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js app

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    try:
        # Get image from request
        if 'image' not in request.files:
            return {'error': 'No image provided'}, 400
        
        file = request.files['image']
        
        # Read image
        input_image = Image.open(file.stream)
        
        # Remove background
        output_image = remove(input_image)
        
        # Save to bytes
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok', 'service': 'rembg-api'}

if __name__ == '__main__':
    print("🚀 Background Removal API running on http://localhost:5000")
    print("📝 Endpoint: POST /remove-bg")
    print("🏥 Health check: GET /health")
    app.run(host='0.0.0.0', port=5000, debug=True)
