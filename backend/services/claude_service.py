import os
from anthropic import Anthropic
from dotenv import load_dotenv
import voyageai

load_dotenv()

class ClaudeService:
    def __init__(self):
        self.claude_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.voyage_client = voyageai.Client(api_key=os.getenv('VOYAGE_API_KEY'))
    
    def generate_embedding(self, text):
        """
        Generate REAL semantic embeddings using Voyage AI
        Returns a 1024-dimension vector for pgvector
        """
        try:
            result = self.voyage_client.embed(
                texts=[text],
                model="voyage-3-large",
                input_type="document"
            )
            return result.embeddings[0]
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def semantic_search(self, query, embedding_column, model_class, db, limit=5):
        """
        Perform semantic search using pgvector
        """
        query_embedding = self.generate_embedding(query)
        if not query_embedding:
            return []
        
        # pgvector cosine similarity search
        results = db.query(model_class).order_by(
            embedding_column.cosine_distance(query_embedding)
        ).limit(limit).all()
        
        return results

# Singleton instance
claude_service = ClaudeService()
