# Configure knowledge (RAG)

## Aurora serverless

Edit [vectorstore.ts](../cdk/lib/constructs/vectorstore.ts) to customize cluster.

```ts
const cluster = new rds.DatabaseCluster(this, "Cluster", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_3,
  }),
  vpc: props.vpc,
  securityGroups: [sg],
  defaultDatabaseName: DB_NAME,
  serverlessV2MinCapacity: 2.0,
  serverlessV2MaxCapacity: 5.0,
  writer: rds.ClusterInstance.serverlessV2("writer", {
    autoMinorVersionUpgrade: false,
  }),
  // readers: [
  //   rds.ClusterInstance.serverlessV2("reader", {
  //     autoMinorVersionUpgrade: false,
  //   }),
  // ],
});
```

## PostgreSQL table definition

If you want to customize ivfflat parameter, edit [index.js](../cdk/custom-resources/setup-pgvector/index.js).

```js
await client.query(`CREATE TABLE IF NOT EXISTS items(
                        id CHAR(26) primary key,
                        botid CHAR(26),
                        content text,
                        source text,
                        embedding vector(1024));`);
await client.query(`CREATE INDEX ON items 
                        USING ivfflat (embedding vector_l2_ops) WITH (lists = 5000);`);
await client.query(`CREATE INDEX ON items (botid);`);
```

## Embed & Store configuration

Edit [main.py](../backend/embedding/main.py), which run on ECS. Currently simple crawling, parsing and chunking feature are implemented using [LangChain](https://python.langchain.com/).

```py
# Calculate embeddings using LangChain
loader = UnstructuredURLLoader(source_urls)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
)
embeddings_model = BedrockEmbeddings(
    client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
)

documents = loader.load()
splitted = text_splitter.split_documents(documents)

contents = [t.page_content for t in splitted]
sources = [t.metadata["source"] for t in splitted]
embeddings = embeddings_model.embed_documents(
    [t.page_content for t in splitted]
)

print(f"number of splitted documents: {len(splitted)}")

# Insert records into postgres
insert_to_postgres(bot_id, contents, sources, embeddings)
```

## Search configuration

Edit [vector_search.py](../backend/app/vector_search.py).

```py
# NOTE: <-> is the KNN by L2 distance in pgvector.
# If you want to use inner product or cosine distance, use <#> or <=> respectively.
# Ref: https://github.com/pgvector/pgvector?tab=readme-ov-file#getting-started
search_query = """
SELECT id, botid, content, source, embedding
FROM items
WHERE botid = %s
ORDER BY embedding <-> %s
LIMIT %s
"""
cursor.execute(search_query, (bot_id, json.dumps(query_embedding), limit))
results = cursor.fetchall()
```

If you want to change the number of chunks for contexts, edit [config.py](../backend/app/config.py).

```py
# Configure search parameter to fetch relevant documents from vector store.
SEARCH_CONFIG = {
    "max_results": 5,
}
```
