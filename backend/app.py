import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import project modules
from backend.translation import translate_text
from backend.extraction import extract_text_from_file
from backend.database import search_glossary, get_db_connection

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/api/translate", methods=["POST"])
def api_translate():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "Missing 'text' in request body"}), 400
        
        text = data["text"]
        language_mode = data.get("language_mode", "en-zu")
        
        translated_text = translate_text(text, language_mode=language_mode)
        return jsonify({
            "original_text": text,
            "translated_text": translated_text,
            "language_mode": language_mode
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/upload-translate", methods=["POST"])
def api_upload_translate():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        language_mode = request.form.get("language_mode", "en-zu")
        
        # Extract text using extraction utility
        extracted_text = extract_text_from_file(file)
        if not extracted_text.strip():
            return jsonify({"error": "Could not extract any text from the uploaded file."}), 400

        translated_text = translate_text(extracted_text, language_mode=language_mode)
        return jsonify({
            "filename": file.filename,
            "extracted_text": extracted_text,
            "translated_text": translated_text,
            "language_mode": language_mode
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/glossary/search", methods=["GET"])
def api_glossary_search():
    """API route to search reviewed glossary terms."""
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"results": [], "message": "Search query parameter 'q' is required."}), 400
    
    try:
        results = search_glossary(query)
        return jsonify({"query": query, "results": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/glossary/suggest", methods=["POST"])
def api_glossary_suggest():
    """Allows learners to submit new term equivalents for review."""
    data = request.get_json()
    if not data or "suggested_equivalent" not in data or "language" not in data:
        return jsonify({"error": "Missing required fields ('suggested_equivalent', 'language')"}), 400
    
    suggested_equivalent = data["suggested_equivalent"]
    language = data["language"]
    reason = data.get("reason_or_example", "")
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO term_suggestions (suggested_equivalent, language, reason_or_example, status)
            VALUES (%s, %s, %s, 'pending');
        """
        cursor.execute(query, (suggested_equivalent, language, reason))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Term suggestion submitted successfully for review!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)