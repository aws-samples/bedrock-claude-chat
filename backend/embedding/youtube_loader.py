import re

from langchain.document_loaders import YoutubeLoader
from langchain_core.documents import Document
from youtube_transcript_api import YouTubeTranscriptApi


def is_url_youtube(url: str) -> bool:
    return url.startswith("https://www.youtube.com/watch?v=")


def _get_video_id(url: str) -> str:
    regex = r"(?<=v=)[^&#]+"
    match = re.search(regex, url)
    if match:
        return match.group(0)
    else:
        return "Invalid URL or Video ID not found"


def _detect_lang(video_id: str) -> str:
    try:
        available_transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        languages = [transcript.language_code for transcript in available_transcripts]
    except Exception as e:
        raise Exception(f"Failed to detect language: {e}")

    # Only the first language is used.
    return languages[0]


class YoutubeLoaderWithLangDetection(YoutubeLoader):
    """Loads a YouTube video transcript and detects the language automatically.
    note: LangChain's YoutubeLoader class requires the language to be specified.
    """

    def __init__(self, urls: list[str]):
        self._urls = urls

    def load(self) -> list[Document]:
        documents = []
        for url in self._urls:
            video_id = _get_video_id(url)
            language = _detect_lang(video_id)
            loader = YoutubeLoader(video_id, language=language)
            documents.extend(loader.load())
        return documents
