import librosa
import numpy as np
import pandas as pd
import os
import glob
import joblib # For saving the model
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

# --- 1. Define Feature Extraction Function ---
# This function will extract MFCC, Chroma, and Mel Spectrogram features
def extract_features(file_name):
    try:
        audio, sample_rate = librosa.load(file_name, res_type='kaiser_fast') 
        
        # MFCCs (Mel-Frequency Cepstral Coefficients)
        mfccs = np.mean(librosa.feature.mfcc(y=audio, sr=sample_rate, n_mfcc=40).T, axis=0)
        
        # Chroma (Pitch Class Profile)
        chroma = np.mean(librosa.feature.chroma_stft(y=audio, sr=sample_rate).T, axis=0)
        
        # Mel Spectrogram
        mel = np.mean(librosa.feature.melspectrogram(y=audio, sr=sample_rate).T, axis=0)
        
        # Combine all features
        features = np.hstack((mfccs, chroma, mel))
        return features
    except Exception as e:
        print(f"Error loading {file_name}: {e}")
        return None

# --- 2. Define Emotion Labels ---
# RAVDESS file naming: 03-01-EMOTION-INTENSITY-STATEMENT-REPETITION-ACTOR.wav
# Emotion (01=neutral, 02=calm, 03=happy, 04=sad, 05=angry, 06=fearful, 07=disgust, 08=surprised)
emotions = {
    '01': 'neutral',
    '02': 'calm',
    '03': 'happy',
    '04': 'sad',
    '05': 'angry',
    '06': 'fearful',
    '07': 'disgust',
    '08': 'surprised'
}

# We will only focus on these emotions
OBSERVED_EMOTIONS = ['calm', 'happy', 'fearful', 'disgust', 'sad', 'angry']

# --- 3. Load Data and Extract Features ---
def load_data(dataset_path):
    X, y = [], []
    for folder in glob.glob(f"{dataset_path}/Actor_*"):
        for file_name in glob.glob(f"{folder}/*.wav"):
            base_name = os.path.basename(file_name)
            emotion = emotions.get(base_name.split('-')[2])
            
            if emotion in OBSERVED_EMOTIONS:
                features = extract_features(file_name)
                if features is not None:
                    X.append(features)
                    y.append(emotion)
                    
    print(f"Loaded {len(X)} files.")
    return np.array(X), np.array(y)

# --- 4. Main Training Process ---
if __name__ == "__main__":
    # Set path to your unzipped RAVDESS dataset
    DATASET_PATH = "D:/Audio_Speech_Actors_01-24"
    
    print("Starting feature extraction...")
    X, y = load_data(DATASET_PATH)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    # --- Feature Scaling ---
    # This is VERY important for many models
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples.")
    
    # --- Train the Model ---
    # We use a Random Forest, which is robust and less prone to overfitting
    model = RandomForestClassifier(n_estimators=200, random_state=42)
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    # --- Evaluate the Model ---
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Training Complete.\nAccuracy: {accuracy * 100:.2f}%")
    
    # --- 5. Save the Model and Scaler ---
    # We must save the scaler so we can process new audio the same way
    joblib.dump(model, "ser_model.joblib")
    joblib.dump(scaler, "ser_scaler.joblib")
    print("Model and scaler saved to 'ser_model.joblib' and 'ser_scaler.joblib'")