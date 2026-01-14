import os
import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI  # <-- Import the OpenAI library
from dotenv import load_dotenv # <-- To load .env
import joblib
import librosa
import numpy as np
import io
from fastapi import File, UploadFile
from pydantic import BaseModel
from pydub import AudioSegment
import soundfile as sf
# Load environment variables from .env file
load_dotenv()

# --- Initialize Groq Client ---
# Note: We use the OpenAI() class, but point it to Groq's URL
client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1", # <-- This is the key part
)

# Initialize FastAPI app
app = FastAPI()

# --- CORS Middleware ---
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # CHANGE THIS: Allow all origins (easiest for deployment)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    ser_model = joblib.load("ser_model.joblib")
    ser_scaler = joblib.load("ser_scaler.joblib")
    print("Speech Emotion Recognition model loaded successfully.")
except FileNotFoundError:
    print("SER model files not found. Please run train_model.py first.")
    ser_model = None
    ser_scaler = None

# --- Phase 3: Feature Extraction Function (must be identical to training) ---
def extract_features_live(audio_data, sample_rate):
    try:
        mfccs = np.mean(librosa.feature.mfcc(y=audio_data, sr=sample_rate, n_mfcc=40).T, axis=0)
        chroma = np.mean(librosa.feature.chroma_stft(y=audio_data, sr=sample_rate).T, axis=0)
        mel = np.mean(librosa.feature.melspectrogram(y=audio_data, sr=sample_rate).T, axis=0)
        features = np.hstack((mfccs, chroma, mel))
        return features
    except Exception as e:
        print(f"Error in feature extraction: {e}")
        return None

# --- Phase 3: Pydantic model for voice response ---
class VoiceResponse(BaseModel):
    emotion: str
    error: str | None = None

# --- Phase 3: New Endpoint for Voice Analysis ---
@app.post("/analyze-voice", response_model=VoiceResponse)
async def analyze_voice(file: UploadFile = File(...)):
    """
    Analyzes the emotion of an audio file.
    """
    if not ser_model or not ser_scaler:
        return VoiceResponse(emotion="Error", error="SER model not loaded on server.")
        
    try:
        # Read the file-like object into memory
       # audio_data, sample_rate = librosa.load(io.BytesIO(await file.read()), res_type='kaiser_fast')
        # 1. Read the uploaded file bytes
        file_bytes = await file.read()

        # 2. Use pydub to load the audio from memory (handles .webm)
        # We specify the format because it's coming from bytes
        audio_segment = AudioSegment.from_file(io.BytesIO(file_bytes), format="webm")

        # 3. Convert to WAV format in memory for librosa
        # We set channels=1 (mono) and frame_rate=22050 (or 48000, 44100, etc.)
        # Let's match the RAVDESS standard (mono, 48kHz) but resample later
        audio_segment = audio_segment.set_channels(1)
        
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0) # Rewind the in-memory file

        # 4. Load the in-memory WAV data with librosa
        # We can now use librosa.load, which uses soundfile
        audio_data, sample_rate = librosa.load(wav_io, res_type='kaiser_fast')

        # Extract features
        features = extract_features_live(audio_data, sample_rate)
        if features is None:
            return VoiceResponse(emotion="Error", error="Could not extract features from audio.")

        # --- IMPORTANT ---
        # 1. Reshape features to a 2D array (for the scaler)
        features_2d = features.reshape(1, -1)
        # 2. Scale the features using the *loaded* scaler
        scaled_features = ser_scaler.transform(features_2d)
        
        # 3. Make a prediction
        prediction = ser_model.predict(scaled_features)
        
        # The prediction is an array, e.g., ['happy']
        emotion = prediction[0]
        
        print(f"Predicted emotion: {emotion}")
        return VoiceResponse(emotion=emotion)

    except Exception as e:
        print(f"Error processing audio file: {e}")
        return VoiceResponse(emotion="Error", error=str(e))
    
# --- Pydantic Models ---
class JournalEntry(BaseModel):
    text: str

class MoodResponse(BaseModel):
    mood: str
    summary: str
    color_hex: str
    
# --- The Structured JSON Prompt ---
# We define the prompt here to keep the function clean
SYSTEM_PROMPT = """
You are an expert mental wellness assistant named "MirrorMind". Your job is to
analyze a user's journal entry with empathy and provide a structured analysis.

Analyze the following journal entry and respond ONLY with a single, minified JSON object
in the following format:
{
  "mood": "The single dominant emotion (e.g., Positive, Negative, Neutral, Anxious, Grateful, Tired)",
  "summary": "A brief, empathetic 1-2 sentence summary reflecting the user's feelings.",
  "color_hex": "A hex color code representing the mood (e.g., #4ade80 for positive, #f87171 for negative, #60a5fa for neutral)."
}

Do not include any other text, greetings, or explanations before or after the JSON.
"""

# --- API Endpoints ---
@app.get("/")
def read_root():
    return {"message": "MirrorMind AI API is running (Groq Backend)"}

@app.post("/analyze-mood/", response_model=MoodResponse)
async def analyze_mood(entry: JournalEntry):
    """
    Analyzes the mood of a journal entry using Groq.
    """
    print(f"Received text: {entry.text[:50]}...")

    try:
        # --- Real AI Call to Groq ---
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": entry.text,
                }
            ],
            model="llama-3.1-8b-instant", # Or "mixtral-8x7b-32768"
            temperature=0.3,
            max_tokens=150,
            response_format={"type": "json_object"}, # Enforce JSON output
        )
        
        # Extract the JSON string from the response
        response_text = chat_completion.choices[0].message.content
        print(f"LLM JSON Response: {response_text}")

        # Parse the JSON string into a Python dictionary
        data = json.loads(response_text)

        # Validate and return the data using the Pydantic model
        return MoodResponse(**data)

    except json.JSONDecodeError:
        print("Error: Failed to decode JSON from LLM response")
        return MoodResponse(
            mood="Error",
            summary="The AI response was not in the correct format. Please try again.",
            color_hex="#ff0000"
        )
    except Exception as e:
        print(f"An error occurred: {e}")
        # Return a generic error response
        return MoodResponse(
            mood="Error",
            summary=f"An API error occurred: {str(e)}",
            color_hex="#ff0000"
        )
