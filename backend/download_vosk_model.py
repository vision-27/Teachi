#!/usr/bin/env python3
"""
Script to download and set up the Vosk speech recognition model.
Run this script to download the English model for offline speech recognition.
"""

import os
import urllib.request
import zipfile
import sys

def download_vosk_model():
    """Download and extract the Vosk English model"""
    model_url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
    model_zip = "vosk-model-small-en-us-0.15.zip"
    model_dir = "vosk-model-small-en-us-0.15"
    
    # Check if model already exists
    if os.path.exists(model_dir):
        print(f"Model directory {model_dir} already exists. Skipping download.")
        return True
    
    print("Downloading Vosk English model...")
    print(f"URL: {model_url}")
    print("This may take a few minutes depending on your internet connection...")
    
    try:
        # Download the model
        urllib.request.urlretrieve(model_url, model_zip)
        print(f"Downloaded {model_zip}")
        
        # Extract the model
        print("Extracting model...")
        with zipfile.ZipFile(model_zip, 'r') as zip_ref:
            zip_ref.extractall()
        
        # Clean up zip file
        os.remove(model_zip)
        print(f"Extracted to {model_dir}")
        print("Vosk model setup complete!")
        return True
        
    except Exception as e:
        print(f"Error downloading model: {e}")
        print("\nManual download instructions:")
        print("1. Visit: https://alphacephei.com/vosk/models")
        print("2. Download: vosk-model-small-en-us-0.15.zip")
        print("3. Extract to the backend directory")
        return False

if __name__ == "__main__":
    success = download_vosk_model()
    if success:
        print("\n✅ Vosk model is ready for offline speech recognition!")
    else:
        print("\n❌ Failed to download model. Please download manually.")
        sys.exit(1)
