from services.claude_service import claude_service

# Test embedding generation
text = "Experienced CEO with 20 years in technology and finance sectors"
print("Testing Claude API...")
print("Generating embedding for:", text)

embedding = claude_service.generate_embedding(text)

if embedding:
    print(f"✅ Embedding generated!")
    print(f"✅ Dimension: {len(embedding)}")
    print(f"✅ Sample values: {embedding[:5]}")
else:
    print("❌ Failed to generate embedding")
