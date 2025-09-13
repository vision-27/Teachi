from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import speech_recognition as sr
from gtts import gTTS
import playsound
import os
import asyncio
from typing import List, Dict, Any, Optional

from dummy_data import lessons, lesson_details

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from port 3000
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



# --- System Prompt ---
system_prompt = (
    "You are an AI teaching assistant for classrooms. "
    "Answer clearly, step by step, using simple examples. "
    "Support the teacher, never reference the internet. "
    "Keep answers short and helpful (max 50 words)."
)

# --- Request Models ---
class AskRequest(BaseModel):
    userPrompt: str

class VoiceRequest(BaseModel):
    lesson_id: str
    lesson_section_id: str
    lessons_step: str

class Lesson(BaseModel):
    id: str
    title: str
    summary: str

class LessonStep(BaseModel):
    step: str
    description: str

class LessonSection(BaseModel):
    id: str
    title: str
    content: Any  # Can be string or List[LessonStep]

class LessonDetail(BaseModel):
    id: str
    title: str
    sections: List[LessonSection]


# --- Function to query Ollama ---
def ask_ollama(prompt: str) -> str:
    final_prompt = system_prompt + "\n\n" + prompt

    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"],
        input=final_prompt.encode(),
        capture_output=True
    )
    return result.stdout.decode().strip()




# --- Natural TTS with gTTS ---
def speak(text: str):
    file = "speech.mp3"
    tts = gTTS(text=text, lang="en")
    tts.save(file)
    playsound.playsound(file)
    os.remove(file)


# --- Speech Recognition ---
recognizer = sr.Recognizer()

def listen():
    try:
        with sr.Microphone() as source:  # Use default microphone
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
        return recognizer.recognize_google(audio)
    except Exception as e:
        return None




# --- API Endpoints ---

@app.get("/api/lessons")
async def get_lessons():
    """Get all available lessons."""
    # Simulate a small delay
    await asyncio.sleep(0.5)
    return lessons

@app.get("/api/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: str):
    """Get detailed information about a specific lesson."""
    # Simulate a small delay
    await asyncio.sleep(0.5)
    
    lesson_detail = lesson_details.get(lesson_id)
    
    if not lesson_detail:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Lesson not found",
                "message": f"No lesson found with id: {lesson_id}"
            }
        )
    
    return lesson_detail

@app.post("/text")
def text_endpoint(request: AskRequest):
    """Handles text input, returns JSON only (no TTS)."""
    response = ask_ollama(request.userPrompt)
    return {"input": request.userPrompt, "response": response}


@app.post("/voice")
def voice_endpoint(request: VoiceRequest):
    """Handles voice input, speaks aloud and returns JSON."""
    spoken_text = listen()
    if not spoken_text:
        return {"response": "No speech detected."}

    response = ask_ollama(spoken_text) # TODO include the voice request body to give more context 
    # speak(response)  # 👈 only /voice triggers TTS
    return {"input": spoken_text, "response": response}
