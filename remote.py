import os
from dotenv import load_dotenv
from deepgram import DeepgramClient, PrerecordedOptions, UrlSource

# Load environment variables from .env file
load_dotenv()

# Get your Deepgram API key
api_key = os.getenv("DEEPGRAM_API_KEY")

# Define the remote audio file URL
AUDIO_URL: UrlSource = {
    "url": "https://dpgr.am/bueller.wav"
}

def main():
    try:
        # Initialize Deepgram client with your API key
        deepgram = DeepgramClient(api_key=api_key)

        # Configure transcription options
        options = PrerecordedOptions(
            model="nova-3",
            smart_format=True
        )

        # Send the URL for transcription
        response = deepgram.listen.rest.v("1").transcribe_url(AUDIO_URL, options)

        # Print full transcript (formatted)
        print(response.to_json(indent=4))

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    main()
