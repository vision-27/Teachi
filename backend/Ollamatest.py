import subprocess
import speech_recognition as sr
import pyttsx3

# --- System Prompt ---
system_prompt = (
    "You are an AI teaching assistant for classrooms. "
    "Answer clearly, step by step, using simple examples. "
    "Support the teacher, never reference the internet. "
    "Keep answers short and helpful (max 50 words)."
)

# --- Function to query Ollama ---
def ask_ollama(prompt):
    final_prompt = system_prompt + "\n\n" + prompt

    result = subprocess.run(
        ["ollama", "run", "qwen2.5:7b"],
        input=final_prompt.encode(),
        capture_output=True
    )
    return result.stdout.decode().strip()

# --- Setup Speech Recognition ---
recognizer = sr.Recognizer()

def listen():
    try:
        with sr.Microphone() as source:  # Use default microphone
            recognizer.adjust_for_ambient_noise(source, duration=1)
            print("\n🎙 Speak now (5s timeout)...")
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)
    except sr.WaitTimeoutError:
        print("⏱️ No speech detected.")
        return None
    except Exception as e:
        print(f"⚠️ Microphone error: {e}")
        return None

    try:
        text = recognizer.recognize_google(audio)
        print("You:", text)
        return text
    except sr.UnknownValueError:
        print("❌ Could not understand")
        return None
    except sr.RequestError:
        print("⚠️ Speech service unavailable")
        return None

# --- Setup TTS (persistent robo voice) ---
engine = pyttsx3.init()
engine.setProperty("rate", 170)  # adjust speaking speed
voices = engine.getProperty("voices")
if voices:
    engine.setProperty("voice", voices[0].id)  # use first available voice

def speak(text):
    print("\nAI:", text)
    engine.say(text)
    engine.runAndWait()


# --- Main Loop ---
if __name__ == "__main__":
    print("TutorAI ready 🎓 (Mic: Default)")

    while True:
        try:
            user_input = listen()
            if not user_input:
                continue

            lower_input = user_input.lower()

            if lower_input in ["exit", "quit", "stop", "bye"]:
                speak("Goodbye!")
                break

            # --- General question for AI ---
            print("\nThinking...\n")
            response = ask_ollama(user_input)
            speak(response)

        except KeyboardInterrupt:
            print("\nChat ended.")
            break
