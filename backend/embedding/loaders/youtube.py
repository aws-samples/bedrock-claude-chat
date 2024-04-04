from typing import Any, Sequence, Union
from urllib.parse import parse_qs, urlparse

from embedding.loaders.base import BaseLoader, Document
from youtube_transcript_api import (
    NoTranscriptFound,
    TranscriptsDisabled,
    YouTubeTranscriptApi,
)

ALLOWED_SCHEMAS = {"http", "https"}
ALLOWED_NETLOCK = {
    "youtu.be",
    "m.youtube.com",
    "youtube.com",
    "www.youtube.com",
    "www.youtube-nocookie.com",
    "vid.plus",
}


def _parse_video_id(url: str) -> str | None:
    """Parse a youtube url and return the video id if valid, otherwise None."""
    parsed_url = urlparse(url)

    if parsed_url.scheme not in ALLOWED_SCHEMAS:
        return None

    if parsed_url.netloc not in ALLOWED_NETLOCK:
        return None

    path = parsed_url.path

    if path.endswith("/watch"):
        query = parsed_url.query
        parsed_query = parse_qs(query)
        if "v" in parsed_query:
            ids = parsed_query["v"]
            video_id = ids if isinstance(ids, str) else ids[0]
        else:
            return None
    else:
        path = parsed_url.path.lstrip("/")
        video_id = path.split("/")[-1]

    if len(video_id) != 11:  # Video IDs are 11 characters long
        return None

    return video_id


def _detect_lang(video_id: str) -> str:
    try:
        available_transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        languages = [transcript.language_code for transcript in available_transcripts]
    except Exception as e:
        raise Exception(f"Failed to detect language: {e}")

    # Only the first language is used.
    return languages[0]


class YoutubeLoader(BaseLoader):
    """Load `YouTube` transcripts."""

    def __init__(
        self,
        video_id: str,
        language: Union[str, Sequence[str]] = "en",
        translation: str | None = None,
        continue_on_failure: bool = False,
    ):
        """Initialize with YouTube video ID."""
        self.video_id = video_id
        self.language = language
        if isinstance(language, str):
            self.language = [language]
        else:
            self.language = language
        self.translation = translation
        self.continue_on_failure = continue_on_failure

    @staticmethod
    def extract_video_id(youtube_url: str) -> str:
        """Extract video id from common YT urls."""
        video_id = _parse_video_id(youtube_url)
        if not video_id:
            raise ValueError(
                f"Could not determine the video ID for the URL {youtube_url}"
            )
        return video_id

    def load(self) -> list[Document]:
        """Load documents."""
        metadata = {"source": self.video_id}

        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(self.video_id)
        except TranscriptsDisabled:
            return []

        try:
            transcript = transcript_list.find_transcript(self.language)
        except NoTranscriptFound:
            transcript = transcript_list.find_transcript(["en"])

        if self.translation is not None:
            transcript = transcript.translate(self.translation)

        transcript_pieces = transcript.fetch()

        transcript = " ".join([t["text"].strip(" ") for t in transcript_pieces])

        return [Document(page_content=transcript, metadata=metadata)]


class YoutubeLoaderWithLangDetection(YoutubeLoader):
    """Loads a YouTube video transcript and detects the language automatically."""

    def __init__(self, urls: list[str]):
        self._urls = urls

    def load(self) -> list[Document]:
        documents = []
        for url in self._urls:
            video_id = YoutubeLoader.extract_video_id(url)
            language = _detect_lang(video_id)
            loader = YoutubeLoader(video_id, language=language)
            documents.extend(loader.load())
        return documents
