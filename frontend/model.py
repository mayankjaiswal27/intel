from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import DPRQuestionEncoder, DPRQuestionEncoderTokenizer, DPRContextEncoder, DPRContextEncoderTokenizer
import faiss
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Check if GPU is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load dataset
df = pd.read_csv("insurance_qa_10000.csv")
answers = df['answers'].tolist()

# Load pre-trained models and move them to GPU
ctx_encoder = DPRContextEncoder.from_pretrained("./models--facebook--dpr-ctx_encoder-multiset-base").to(device)
ctx_tokenizer = DPRContextEncoderTokenizer.from_pretrained("./models--facebook--dpr-ctx_encoder-multiset-base")
question_encoder = DPRQuestionEncoder.from_pretrained("./models--facebook--dpr-question_encoder-multiset-base").to(device)
question_tokenizer = DPRQuestionEncoderTokenizer.from_pretrained("./models--facebook--dpr-question_encoder-multiset-base")

# Encode passages
def encode_passages(passages):
    inputs = ctx_tokenizer(passages, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        embeddings = ctx_encoder(**inputs).pooler_output
    return embeddings.cpu().numpy()  # Move back to CPU for FAISS compatibility

# Encode passages and build FAISS index
passage_embeddings = encode_passages(answers)
index = faiss.IndexFlatL2(passage_embeddings.shape[1])
index.add(passage_embeddings)

# Retrieve best answer
def get_best_answer(question):
    inputs = question_tokenizer(question, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        question_embedding = question_encoder(**inputs).pooler_output.cpu().numpy()  # Move back to CPU for FAISS compatibility
    _, indices = index.search(question_embedding, k=1)
    return answers[indices[0][0]]

# Flask endpoint
@app.route('/process', methods=['POST'])
def process():
    prompt = request.form.get('prompt')
    print(prompt)
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    best_answer = get_best_answer(prompt)
    print(best_answer)
    return jsonify({"answer": best_answer})

if __name__ == "__main__":
    app.run(debug=True,use_reloader=False)
