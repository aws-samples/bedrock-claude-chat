import json
import os

import boto3
import nest_asyncio
import xmltodict
from langchain.document_loaders import (
    SitemapLoader,
    UnstructuredURLLoader,
    WebBaseLoader,
)
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from lxml import etree

nest_asyncio.apply()

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = os.environ.get("MODEL_ID", "cohere.embed-multilingual-v3")
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
    # with open("sitemap_example.xml", "r") as f:
    #     sitemap_xml = f.read()
    # d = xmltodict.parse(sitemap_xml)
    # urlset = d["urlset"]
    # print(urlset["url"])
    # print(len(urlset["url"]))

    # bedrock = boto3.client(service_name="bedrock", region_name=BEDROCK_REGION)
    # json_data = bedrock.list_foundation_models()
    # model_ids = [
    #     model_summary["modelId"] for model_summary in json_data["modelSummaries"]
    # ]
    # print(model_ids)

    # loader = SitemapLoader(web_path="https://python.langchain.com/sitemap.xml")
    # print(loader.load())

    urls = [
        " https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonMSK_0430_v1.pdf"
    ]
    loader = UnstructuredURLLoader(urls)
    documents = loader.load()

    print(documents)

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
