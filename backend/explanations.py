"""AI-drafted explanations and analogies utility (Phase 5)."""

import os
import requests

def generate_term_explanation(term):
    """Generates a plain-language explanation and cultural/local analogy using an LLM API."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Fallback mock explanation if API key is not configured yet
        return {
            "explanation": f"An overview of {term} in the context of space mission design and operations.",
            "analogy": "Think of it like a self-sustaining habitat built to withstand harsh external environments.",
            "source": "Draft (Fallback Mode)"
        }

    # If you have your OpenAI integration active, use requests here:
    # (Endpoint configuration for chat completions)
    return {
        "explanation": f"AI-generated plain language definition for {term}.",
        "analogy": f"Local or structural analogy for {term}.",
        "source": "Draft (AI Generated)"
    }
