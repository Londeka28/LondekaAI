"""Vulavula requests and language-code mapping (Phase 2)."""
import os
import requests

VULAVULA_URL = "https://vulavula-services.lelapa.ai/api/v1/translate/process"

# Vulavula language codes used by this project.
LANGUAGES = {
    "english": "eng_Latn",
    "zulu": "zul_Latn",
    "afrikaans": "afr_Latn",
}


def translate_text(input_text: str, source_lang: str, target_lang: str) -> str:
    """Translate input_text from source_lang to target_lang using Vulavula.

    source_lang and target_lang must be keys in LANGUAGES
    (english, zulu, afrikaans).
    """
    if source_lang not in LANGUAGES:
        raise ValueError(f"Unsupported source language: {source_lang}")
    if target_lang not in LANGUAGES:
        raise ValueError(f"Unsupported target language: {target_lang}")

    api_key = os.getenv("VULAVULA_API_KEY")
    if not api_key:
        raise RuntimeError("VULAVULA_API_KEY is not set in the environment")

    headers = {
        "X-CLIENT-TOKEN": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "input_text": input_text,
        "source_lang": LANGUAGES[source_lang],
        "target_lang": LANGUAGES[target_lang],
    }

    response = requests.post(VULAVULA_URL, json=payload, headers=headers, timeout=15)
    response.raise_for_status()
    data = response.json()

    return data.get("translation", "")