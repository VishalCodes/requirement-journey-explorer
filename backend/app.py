import os
import base64
import cv2
import PyPDF2
from openai import OpenAI
from docx import Document
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tempfile
import pandas as pd
import io
import logging

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client with the API key
client = OpenAI()

# Set your OpenAI API key
api_key = os.getenv("OPENAI_API_KEY")

# Initialize Flask app for API
app = Flask(__name__, static_folder='../dist')
CORS(app)  # Enable CORS for all routes

# Add logging
logging.basicConfig(level=logging.DEBUG)

def process_file(file_content, file_ext):
    try:
        if file_ext.lower() == "txt":
            content = file_content.decode("utf-8")
        elif file_ext.lower() == "csv":
            df = pd.read_csv(io.BytesIO(file_content))
            content = df.to_string()
        elif file_ext.lower() == "json":
            content = file_content.decode("utf-8")
        elif file_ext.lower() == "md":
            content = file_content.decode("utf-8")
        elif file_ext.lower() == "pdf":
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            content = "\n".join([page.extract_text() for page in pdf_reader.pages])
        elif file_ext.lower() == "docx":
            doc = Document(io.BytesIO(file_content))
            content = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        elif file_ext.lower() == "xlsx":
            # Read Excel file into pandas DataFrame
            df = pd.read_excel(io.BytesIO(file_content))
            
            # Log DataFrame info
            logging.debug(f"Excel DataFrame shape: {df.shape}")
            logging.debug(f"Excel columns: {df.columns.tolist()}")
            logging.debug(f"First row sample: {df.iloc[0].to_dict() if len(df) > 0 else 'Empty DataFrame'}")
            
            # Convert DataFrame to a more detailed format
            content = "Excel File Contents:\n\n"
            content += f"Total Rows: {len(df)}\n"
            content += f"Total Columns: {len(df.columns)}\n\n"
            content += "Data:\n"
            # Convert DataFrame to a tabular string format
            content += df.to_string(index=False)
            
            logging.debug(f"Processed Excel content (first 500 chars):\n{content[:500]}")
        else:
            return {"error": f"Unsupported file type: {file_ext}"}, 415
        
        # Check if we actually got content
        if not content or content.strip() == "":
            logging.error("No content extracted from file")
            return {"error": "No content could be extracted from the file"}, 400
            
        return {"content": content}, 200
    except Exception as e:
        logging.error(f"Error processing file: {str(e)}")
        return {"error": f"Error processing file: {str(e)}"}, 500

def extract_frames(video_path):
    video = cv2.VideoCapture(video_path)
    if not video.isOpened():
        return []
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    sampling_rate = max(1, total_frames // 300)
    base64Frames = []
    frame_count = 0
    while True:
        ret, frame = video.read()
        if not ret:
            break
        if frame_count % sampling_rate == 0:
            _, buffer = cv2.imencode(".jpg", frame)
            base64_frame = base64.b64encode(buffer).decode("utf-8")
            base64Frames.append(base64_frame)
        frame_count += 1
    video.release()
    return base64Frames

def analyze_video(base64Frames, source_system, destination_system):
    try:
        # Log the input
        logging.debug(f"Analyzing video with {len(base64Frames)} frames")
        
        # Include the frames in the prompt
        frames_description = "\n".join([f"Frame {i+1}: {frame[:100]}..." for i, frame in enumerate(base64Frames)])
        
        prompt = f"""
        You are a Solution Architect specializing in system migrations.
        Analyze the following video frames to extract project requirements.
        
        **Source System:** {source_system}
        **Destination System:** {destination_system}
        
        Video Frames Content:
        {frames_description}
        
        Extract:
        1. Detailed business requirements.
        2. User stories in the format:
           *As a [role], I want [goal] so that [benefit]*
        3. Fit-gap analysis for the migration.
        
        Return results in a structured table.
        """

        response = client.chat.completions.create(
            model="gpt-4",  # Fixed model name
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Analyze the provided video frames."},
            ],
            temperature=0.15
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error in analyze_video: {str(e)}")
        return str(e)

def analyze_text(content, input_type, source_system, destination_system):
    try:
        # Log the input
        logging.debug(f"Analyzing {input_type} content (length: {len(content)})")
        
        prompt = f"""
        You are a Solution Architect specializing in migrations.

        **Input Type:** {input_type}
        **Source System:** {source_system}
        **Destination System:** {destination_system}

        Below is the content from an Excel file. The data is presented in a tabular format:

        {content}

        Based STRICTLY on the data provided above:
        1. List each requirement found in the data (do not invent or assume requirements)
        2. For each actual requirement found, create a user story:
           *As a [role], I want [goal] so that [benefit]*
        3. Create a fit-gap analysis between {source_system} and {destination_system} based only on the requirements found in the data

        Format your response as follows:

        REQUIREMENTS FROM DATA:
        - [List only requirements found in the data]

        USER STORIES:
        - [Convert only the found requirements to user stories]

        FIT-GAP ANALYSIS:
        - [Analysis based only on the found requirements]

        DO NOT generate or assume requirements that are not explicitly present in the data.
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a requirements analyst. Your task is to analyze ONLY the provided data. Do not generate fictional requirements or make assumptions beyond what is explicitly stated in the data."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )
        return response.choices[0].message.content
    except Exception as e:
        logging.error(f"Error in analyze_text: {str(e)}")
        return str(e)

# API Routes
@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        # Log the incoming request
        logging.debug(f"Received request: {request.content_type}")
        
        # Check if the request has the file part
        if 'file' not in request.files and not request.get_json():
            logging.error("No file or JSON data provided")
            return jsonify({"error": "No file or JSON data provided"}), 400
            
        # Handle both multipart form data and JSON requests
        if request.files:
            file = request.files['file']
            input_type = request.form.get('inputType')
            source_system = request.form.get('sourceSystem')
            destination_system = request.form.get('destinationSystem')
            file_ext = file.filename.split('.')[-1] if file.filename else None
            file_data = file.read()
            logging.debug(f"Received file: {file.filename}, size: {len(file_data)} bytes")
        else:
            data = request.get_json()
            input_type = data.get('inputType')
            source_system = data.get('sourceSystem')
            destination_system = data.get('destinationSystem')
            file_data = base64.b64decode(data.get('fileData', ''))
            file_ext = data.get('fileExt')
            logging.debug(f"Received JSON data with file type: {file_ext}, size: {len(file_data)} bytes")
        
        if not all([input_type, source_system, destination_system, file_data, file_ext]):
            return jsonify({"error": "Missing required fields"}), 400

        if input_type in ["BRD", "Audio"]:
            try:
                result, status_code = process_file(file_data, file_ext)
                if status_code != 200:
                    return jsonify(result), status_code
                    
                analysis_result = analyze_text(result['content'], input_type, source_system, destination_system)
                return jsonify({"result": analysis_result}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
                
        elif input_type == "Video":
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as temp_file:
                    temp_file.write(file_data)
                    base64Frames = extract_frames(temp_file.name)
                    os.unlink(temp_file.name)
                    
                if not base64Frames:
                    return jsonify({"error": "Failed to process video frames"}), 500
                    
                analysis_result = analyze_video(base64Frames, source_system, destination_system)
                return jsonify({"result": analysis_result}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Invalid input type"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True) 