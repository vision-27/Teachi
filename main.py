from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import asyncio
from typing import List, Dict, Any, Optional
from enum import Enum
from dummy_data import lessons, lesson_details
import threading
import json
import time

# Offline TTS and STT
from vosk import Model as VoskModel, KaldiRecognizer  # Vosk for offline STT
import pyaudio

# -------------------- FastAPI app --------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- System prompt --------------------
system_prompt = (
    "You are an AI teaching assistant for classrooms. "
    "Answer clearly, step by step, using simple examples. "
    "Contextualize answers to the current lesson."
    "Support the teacher, never reference the internet. "
    "Use natural cadence, short sentences, occasional pauses, and friendly tone(max 50 words)."
    "Understand that you are part of a teaching tool, and your goal is to assist learning."
)

# -------------------- Models --------------------
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
    content: Any

class LessonDetail(BaseModel):
    id: str
    title: str
    sections: List[LessonSection]

# -------------------- Helpers --------------------
def get_lesson_context(lesson_id: str, lesson_section_id: str) -> Optional[str]:
    for section in lesson_details[lesson_id]["sections"]:
        if section["id"] == lesson_section_id:
            return section["content"]
    return None

# -------------------- LLM calls --------------------
def ask_ollama(prompt: str, lesson_context: Optional[str]) -> str:
    final_prompt = f"{system_prompt}\n\nThis is the lesson context: {lesson_context}\n\nThis is the user prompt: {prompt}"
    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"],
        input=final_prompt.encode(),
        capture_output=True
    )
    return result.stdout.decode().strip()

def ask_ollama_anywhere(prompt: str, lesson_context: Optional[str]) -> dict:
    nav_prompt = system_prompt + "\n\nYou can help users navigate lessons or answer questions. If they want to move to a different lesson, respond with the lesson ID. Available lessons: " + str([{"id": lesson["id"], "title": lesson["title"]} for lesson in lessons])
    final_prompt = f"{nav_prompt}\n\nThis is the lesson context: {lesson_context}\n\nThis is the user prompt: {prompt}"
    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"],
        input=final_prompt.encode(),
        capture_output=True
    )
    response = result.stdout.decode().strip()

    lower_response = response.lower()
    if any(nav_word in lower_response for nav_word in ["go to", "move to", "navigate", "switch to"]):
        for lesson in lessons:
            if lesson["title"].lower() in lower_response:
                return {
                    "response": response,
                    "lesson_id": lesson["id"],
                    "action": ShortcutAction.MOVE.value
                }

    return {
        "response": response,
        "lesson_id": "",
        "action": ShortcutAction.ASK.value
    }

# -------------------- TTS worker (robust) --------------------
# Use a dedicated process to own pyttsx3 so it is never called from multiple threads.
from multiprocessing import Process, Queue

tts_queue: Queue = Queue()
tts_process: Optional[Process] = None

def tts_worker(q: Queue):
    # Import and init inside the child process
    import pyttsx3
    engine = pyttsx3.init()
    # Optionally configure voice/rate/volume here once
    engine.setProperty('rate', 172)
    voices = engine.getProperty('voices')
    if voices:
        engine.setProperty('voice', voices[1].id)  # Choose the first voice
    # engine.setProperty('volume', 1.0)
    while True:
        text = q.get()
        if text is None:
            break
        try:
            engine.say(text)
            engine.runAndWait()
        except Exception:
            # Log if needed
            pass
    try:
        engine.stop()
    except Exception:
        pass

def start_tts_worker():
    global tts_process
    if tts_process is None or not tts_process.is_alive():
        p = Process(target=tts_worker, args=(tts_queue,), daemon=True)
        p.start()
        tts_process = p

def enqueue_tts(text: str):
    start_tts_worker()
    tts_queue.put(text)

# Ensure graceful shutdown
import atexit
@atexit.register
def _stop_tts_worker():
    try:
        tts_queue.put(None)
    except Exception:
        pass

# -------------------- Vosk STT --------------------
VOSK_MODEL_PATH = "F:/Teachi/vosk-model-small-en-us-0.15"  # adjust as needed
vosk_model = VoskModel(VOSK_MODEL_PATH)

def listen(timeout: float = 5.0, phrase_time_limit: float = 5.0) -> Optional[str]:
    rate = 16000
    recognizer = KaldiRecognizer(vosk_model, rate)
    recognizer.SetWords(True)

    pa = pyaudio.PyAudio()
    stream = pa.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=rate,
        input=True,
        frames_per_buffer=4096
    )
    stream.start_stream()

    start = time.time()
    last_voice = start
    text_out = ""

    try:
        while True:
            if time.time() - start > timeout + phrase_time_limit:
                break

            data = stream.read(4096, exception_on_overflow=False)
            if recognizer.AcceptWaveform(data):
                res = json.loads(recognizer.Result())
                text_out = res.get("text", "")
                if text_out:
                    break
                last_voice = time.time()
            else:
                partial = json.loads(recognizer.PartialResult()).get("partial", "")
                if partial:
                    last_voice = time.time()

            if time.time() - last_voice > phrase_time_limit:
                res = json.loads(recognizer.FinalResult())
                text_out = res.get("text", "")
                break
    finally:
        stream.stop_stream()
        stream.close()
        pa.terminate()

    return text_out if text_out else None

# -------------------- Endpoints --------------------
@app.get("/api/lessons")
async def get_lessons():
    await asyncio.sleep(0.5)
    return lessons

@app.get("/api/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: str):
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
    lesson_context = get_lesson_context(request.lesson_id, request.lesson_section_id)
    response = ask_ollama(request.userPrompt, lesson_context)
    return {"input": request.userPrompt, "response": response}

@app.post("/voice")
def voice_endpoint(request: VoiceRequest):
    spoken_text = listen()
    if not spoken_text:
        return {"response": "No speech detected."}

    lesson_context = get_lesson_context(request.lesson_id, request.lesson_section_id)
    response = ask_ollama(spoken_text, lesson_context)

    # Tiny pause can help avoid device contention on some backends
    time.sleep(0.05)
    enqueue_tts(response)
    return {"input": spoken_text, "response": response}

@app.post("/shortcut")
def shortcut_endpoint(request: ShortcutRequest):
    spoken_text = listen()
    if not spoken_text:
        return {"response": "No speech detected.", "lesson_id": "", "action": ShortcutAction.ASK.value}

    # Fix: sections is a list; use first element safely
    lesson_context = None
    if request.lesson_id and request.lesson_id in lesson_details:
        sections = lesson_details[request.lesson_id].get("sections", [])
        if isinstance(sections, list) and sections:
            first_section = sections
            lesson_context = first_section.get("content")

    response = ask_ollama_anywhere(spoken_text, lesson_context)
    return response
