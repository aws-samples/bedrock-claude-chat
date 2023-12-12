import os

import boto3
from langchain.document_loaders import (
    SitemapLoader,
    UnstructuredURLLoader,
    WebBaseLoader,
)
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = os.environ.get("MODEL_ID", "amazon.titan-embed-text-v1")
CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", 1000))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", 100))


# def test_lcel(urls: list[str]):
#     loader = UnstructuredURLLoader(urls)
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
#     )
#     embeddings_model = BedrockEmbeddings(
#         client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
#     )
#     chain = loader | text_splitter | embeddings_model


if __name__ == "__main__":
    urls = ["https://docs.kanaries.net/ja/topics/LangChain/langchain-document-loader"]
    loader = UnstructuredURLLoader(urls)
    documents = loader.load()

    # Use chunk_size of 1000.
    # We felt that the answer we would be looking for would be
    # around 200 words, or around 1000 characters.
    # This parameter can be modified based on your documents and use case.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
    )
    texts = text_splitter.split_documents(documents)
    print(f"length of texts: {len(texts)}")
    print(f"first metadata: {texts[0].metadata}")
    print(f"first source: {texts[0].metadata['source']}")
    print(f"first contents: {texts[0].page_content}")

    embeddings_model = BedrockEmbeddings(
        client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
    )
    print("Embedding...")
    embeddings = embeddings_model.embed_documents([t.page_content for t in texts])
    print("Done embedding.")
    print(f"length of embeddings: {len(embeddings)}")
    print(f"length of vector: {len(embeddings[0])}")
    print(f"first embedding: {embeddings[0]}")
