import requests

BASE_URL = "http://127.0.0.1:5000"

print("--- 1. Testing Text Translation Route ---")
text_payload = {
    "text": "Space settlement design requirements and operations.",
    "language_mode": "en-zu"
}

try:
    response = requests.post(f"{BASE_URL}/api/translate", json=text_payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Text translation test failed:", e)

print("\n--- 2. Testing File Upload Translation Route ---")
sample_filename = "sample_test.txt"
with open(sample_filename, "w", encoding="utf-8") as f:
    f.write("Human factors and mission systems in space exploration.")

try:
    with open(sample_filename, "rb") as file_obj:
        files = {"file": (sample_filename, file_obj, "text/plain")}
        data = {"language_mode": "en-af"}
        
        upload_response = requests.post(f"{BASE_URL}/api/upload-translate", files=files, data=data)
        print("Status Code:", upload_response.status_code)
        print("Response JSON:", upload_response.json())
except Exception as e:
    print("File upload test failed:", e)
