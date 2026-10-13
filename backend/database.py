
"""Supabase connection and data operations (Phase 4)."""

import os
from flask import current_app

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        import psycopg2
    except ImportError:
        raise RuntimeError("psycopg2 is not installed in the environment.")
    db_url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("SUPABASE_DB_URL is not configured in the server environment variables.")
    return psycopg2.connect(db_url)

def search_glossary(term_query):
    """Searches approved glossary terms for matching English or translated entries."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT english_term, isizulu_wording, afrikaans_wording, definition, example, status 
            FROM glossary_terms 
            WHERE english_term ILIKE %s OR isizulu_wording ILIKE %s OR afrikaans_wording ILIKE %s;
        """
        search_pattern = f"%{term_query}%"
        cursor.execute(query, (search_pattern, search_pattern, search_pattern))
        results = cursor.fetchall()
        
        glossary_list = []
        for row in results:
            glossary_list.append({
                "english_term": row[0],
                "isizulu_wording": row[1],
                "afrikaans_wording": row[2],
                "definition": row[3],
                "example": row[4],
                "status": row[5]
            })
        return glossary_list
    finally:
        cursor.close()
        conn.close()
