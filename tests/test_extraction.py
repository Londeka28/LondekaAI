import io
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "backend"))
from extraction import extract_text_from_file

class DummyFileStorage:
    def __init__(self, filename: str, content: bytes):
        self.filename = filename
        self._bio = io.BytesIO(content)

    def read(self, *args):
        return self._bio.read(*args)

    def seek(self, *args):
        return self._bio.seek(*args)

def test_extract_txt_file():
    mock_file = DummyFileStorage("sample.txt", "Space design competition RFP document.".encode("utf-8"))
    extracted = extract_text_from_file(mock_file)
    assert extracted == "Space design competition RFP document."
