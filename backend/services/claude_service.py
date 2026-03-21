import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

class ClaudeService:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    def generate_embedding(self, text):
        """
        Generate embeddings for text using Claude's API
        Returns a 1536-dimension vector for pgvector
        """
        try:
            # For now, we'll use a simple approach
            # In production, you'd use a dedicated embedding model
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[{
                    "role": "user",
                    "content": f"Generate a semantic summary of this text in 50 words: {text}"
                }]
            )
            
            # Get the response text
            summary = response.content[0].text
            
            # Convert to embedding (simplified - in production use proper embedding model)
            # For now, return a placeholder embedding
            # We'll improve this in the next step
            embedding = self._text_to_embedding(summary)
            return embedding
            
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None
    
    def _text_to_embedding(self, text):
        """
        Convert text to a 1536-dimension embedding
        This is a placeholder - we'll use proper embedding API next
        """
        import hashlib
        import numpy as np
        
        # Generate a consistent hash-based embedding (placeholder)
        hash_obj = hashlib.sha256(text.encode())
        hash_bytes = hash_obj.digest()
        
        # Expand to 1536 dimensions
        seed = int.from_bytes(hash_bytes[:4], 'big')
        np.random.seed(seed)
        embedding = np.random.randn(1536).tolist()
        
        return embedding
    
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
