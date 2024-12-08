from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
from transformers import pipeline, DPRQuestionEncoder, DPRQuestionEncoderTokenizer, DPRContextEncoder, DPRContextEncoderTokenizer
import faiss
import numpy as np
import os
import re
import fitz  # PyMuPDF

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load datasets for insurance recommendations
insurance_df = pd.read_csv('insurance_plans_5000.csv')
user_df = pd.read_csv('user_needs_5000.csv')

# Function to recommend insurance plans based on user input (insurance plan name)
def recommend_insurance(user_needs_input, insurance_df):
    # Vectorize the coverage options and user needs using TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')

    # Combine all insurance coverage descriptions into a single list
    insurance_coverages = insurance_df['coverage'].tolist()

    # Combine user input with insurance coverages for vectorization
    all_texts = insurance_coverages + [user_needs_input]

    # Fit the vectorizer to the combined list of coverage texts and user needs
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    # Compute cosine similarities between the user input (last item) and all insurance plans
    cosine_similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])

    # Get the indices of the top 5 most similar insurance plans
    similar_indices = cosine_similarities[0].argsort()[-5:][::-1]

    # Retrieve the top 5 recommended insurance plans
    recommendations = insurance_df.iloc[similar_indices]

    return recommendations[['insurance_plan_id', 'name', 'coverage', 'region']]

# Initialize the summarization pipeline for QnA and summarization functionality
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# List of red flag keywords or phrases to detect
RED_FLAGS = [
    "penalty", "termination", "non-compliance", "breach", "indemnity",
    "force majeure", "liability", "arbitration", "confidentiality",
    "dispute resolution", "late payment", "default", "exclusion clause"
]

# Check if GPU is available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load dataset for QnA
df = pd.read_csv("insurance_qa_10000.csv")
answers = df['answers'].tolist()

# Load pre-trained models for QnA
ctx_encoder = DPRContextEncoder.from_pretrained("./models--facebook--dpr-ctx_encoder-multiset-base").to(device)
ctx_tokenizer = DPRContextEncoderTokenizer.from_pretrained("./models--facebook--dpr-ctx_encoder-multiset-base")
question_encoder = DPRQuestionEncoder.from_pretrained("./models--facebook--dpr-question_encoder-multiset-base").to(device)
question_tokenizer = DPRQuestionEncoderTokenizer.from_pretrained("./models--facebook--dpr-question_encoder-multiset-base")

# File path to store the embeddings
embedding_file = 'passage_embeddings.npy'

# Encode passages and either load or compute embeddings
def encode_passages(passages):
    inputs = ctx_tokenizer(passages, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        embeddings = ctx_encoder(**inputs).pooler_output
    return embeddings.cpu().numpy()  # Move back to CPU for FAISS compatibility

# Load or compute embeddings
if os.path.exists(embedding_file):
    print("Loading precomputed embeddings...")
    passage_embeddings = np.load(embedding_file)
else:
    print("Computing embeddings...")
    passage_embeddings = encode_passages(answers)
    np.save(embedding_file, passage_embeddings)  # Save embeddings for future use

# Build FAISS index for QnA
index = faiss.IndexFlatL2(passage_embeddings.shape[1])
index.add(passage_embeddings)

# Retrieve best answer for QnA
def get_best_answer(question):
    inputs = question_tokenizer(question, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        question_embedding = question_encoder(**inputs).pooler_output.cpu().numpy()  # Move back to CPU for FAISS compatibility
    _, indices = index.search(question_embedding, k=1)
    return answers[indices[0][0]]

# Summarize text and identify red flags
def extract_text_from_pdf(file_path):
    """
    Extract text from a PDF file using PyMuPDF.
    """
    try:
        # Open the PDF file
        doc = fitz.open(file_path)

        # Initialize an empty string to store the extracted text
        text = ""

        # Iterate through each page of the PDF
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text += page.get_text()  # Extract text from the page

        # Return the extracted text
        return text

    except Exception as e:
        print(f"Error reading PDF file: {e}")
        return None

def chunk_text(text, max_chunk_size=1000):
    """
    Break the input text into smaller chunks of manageable size for summarization.
    """
    text_chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]
    return text_chunks

def identify_red_flags(text):
    """
    Check the document for red flags based on predefined keywords.
    """
    red_flags_found = []
    for flag in RED_FLAGS:
        if re.search(r"\b" + re.escape(flag) + r"\b", text, re.IGNORECASE):
            red_flags_found.append(flag)
    return red_flags_found

def summarize_file(file_content):
    """
    Summarize the content of the document in chunks to avoid large input errors.
    """
    if file_content:
        # Split text into chunks if it's too long
        chunks = chunk_text(file_content)
        summaries = []

        # Summarize each chunk
        for chunk in chunks:
            summary = summarizer(chunk, max_length=130, min_length=30, do_sample=False)
            summaries.append(summary[0]['summary_text'])

        # Combine the summaries into one final summary
        final_summary = " ".join(summaries)

        # Return the final summary
        return final_summary
    else:
        return None

# Flask route for QnA
@app.route('/qna', methods=['POST'])
def process_qna():
    prompt = request.form.get('prompt')
    type=request.form.get('type')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    best_answer = get_best_answer(prompt)
    return jsonify({"answer": best_answer,"type":type})

# Flask route for Summariser
@app.route('/summariser', methods=['POST'])
def process_summariser():
    prompt = request.form.get('prompt')
    type=request.form.get('type')
    file = request.files.get('file')

    if not prompt and not file:
        return jsonify({"error": "No prompt or file provided"}), 400

    if file:
        # Extract content from file
        file_path = file.filename
        file.save(file_path)
        content = extract_text_from_pdf(file_path)
    else:
        content = prompt

    # Summarize the content
    summary = summarize_file(content)

    # Identify red flags
    red_flags = identify_red_flags(content)

    return jsonify({
        "summary": summary,
        "red_flags": red_flags
        ,"type":type
    })

# Flask route for Insurance Recommendations
@app.route('/recommendation', methods=['POST'])
def get_recommendations():
    user_needs_input = request.form.get('prompt')
    if not user_needs_input:
        return jsonify({"error": "No user needs input provided"}), 400

    # Get recommendations based on user needs input
    recommendations = recommend_insurance(user_needs_input, insurance_df)
    print(recommendations.to_dict(orient='records'))
    return jsonify({"response":recommendations.to_dict(orient='records'),"type":"recommendation"})

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
