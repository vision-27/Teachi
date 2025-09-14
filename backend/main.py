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
from enum import Enum
from dummy_data import lessons, lesson_details
import threading

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
    lesson_id: str
    lesson_section_id: str
    lessons_step: str
    userPrompt: str

class VoiceRequest(BaseModel):
    lesson_id: str
    lesson_section_id: str
    lessons_step: str

class ShortcutRequest(BaseModel):
    lesson_id: str

class MoveToLesson(BaseModel):
    lesson_id: str

class ShortcutAction(Enum):
    ASK = "ask"
    MOVE = "move"

class ShortcutResponse(BaseModel):
    response: str
    lesson_id: str
    action: ShortcutAction

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

def get_lesson_context(lesson_id: str, lesson_section_id: str) -> str:
    for section in lesson_details[lesson_id]["sections"]:
        if section["id"] == lesson_section_id:
            return section["content"]
    return None

# --- Function to query Ollama ---
def ask_ollama(prompt: str, lesson_context: str) -> str:
    final_prompt = f"{system_prompt}\n\nThis is the lesson context: {lesson_context}\n\nThis is the user prompt: {prompt}"

    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"],
        input=final_prompt.encode(),
        capture_output=True
    )
    return result.stdout.decode().strip()

def ask_ollama_anywhere(prompt: str, lesson_context: str) -> dict:
    # This function is for any page and it can be to also move pages.
    # Add navigation context to system prompt
    nav_prompt = system_prompt + "\n\nYou can help users navigate lessons or answer questions. If they want to move to a different lesson, respond with the lesson ID. Available lessons: " + str([{"id": lesson["id"], "title": lesson["title"]} for lesson in lessons])

    final_prompt = f"{nav_prompt}\n\nThis is the lesson context: {lesson_context}\n\nThis is the user prompt: {prompt}"

    # Query Ollama
    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"], 
        input=final_prompt.encode(),
        capture_output=True
    )
    response = result.stdout.decode().strip()

    # Check if response indicates navigation
    lower_response = response.lower()
    if any(nav_word in lower_response for nav_word in ["go to", "move to", "navigate", "switch to"]):
        # Extract lesson info from response
        for lesson in lessons:
            if lesson["title"].lower() in lower_response:
                return {
                    "response": response,
                    "lesson_id": lesson["id"],
                    "action": ShortcutAction.MOVE.value
                }
    
    # Default to ASK action if no navigation detected
    return {
        "response": response,
        "lesson_id": "",
        "action": ShortcutAction.ASK.value
    }


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
    lesson_context = get_lesson_context(request.lesson_id, request.lesson_section_id)
    response = ask_ollama(request.userPrompt, lesson_context)
    return {"input": request.userPrompt, "response": response}


@app.post("/voice")
def voice_endpoint(request: VoiceRequest):
    """Handles voice input, speaks aloud and returns JSON."""
    spoken_text = listen()
    if not spoken_text:
        return {"response": "No speech detected."}

    lesson_context = get_lesson_context(request.lesson_id, request.lesson_section_id)
    response = ask_ollama(spoken_text, lesson_context)
    # Start TTS in background thread so we can return immediately
    threading.Thread(target=speak, args=(response,), daemon=True).start()
    return {"input": spoken_text, "response": response}

@app.post("/shortcut")
# Short cut end point is for voice input to either ask questions or to move to pages
def shortcut_endpoint(request: ShortcutRequest):
    """Handles voice input for navigation between lessons.
    Only requires lesson_id to determine current context.
    """
    spoken_text = listen()
    if not spoken_text:
        return {"response": "No speech detected.", "lesson_id": "", "action": ShortcutAction.ASK.value}

    print(spoken_text)

    # Get lesson context if lesson_id is provided
    lesson_context = None
    if request.lesson_id and request.lesson_id in lesson_details:
        # Get the first section as context for navigation
        first_section = lesson_details[request.lesson_id]["sections"][0]
        lesson_context = first_section["content"]
    
    response = ask_ollama_anywhere(spoken_text, lesson_context)
    
    print(response)
    return response