# Configure RAG Parameters

## Aurora serverless

Edit [vectorstore.ts](../cdk/lib/constructs/vectorstore.ts) to customize the cluster. This sample utilizes writer instance only.

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

If you want to customize ivfflat parameter, edit [index.js](../cdk/custom-resources/setup-pgvector/index.js). Also see [blog](https://www.timescale.com/blog/nearest-neighbor-indexes-what-are-ivfflat-indexes-in-pgvector-and-how-do-they-work/) to check the recommended parameters.

```js
// NOTE: Cohere multi lingual embedding dimension is 1024
// Ref: https://txt.cohere.com/introducing-embed-v3/
await client.query(`CREATE TABLE IF NOT EXISTS items(
                        id CHAR(26) primary key,
                        botid CHAR(26),
                        content text,
                        source text,
                        embedding vector(1024));`);
// `lists` parameter controls the nubmer of clusters created during index building.
// Also it's important to choose the same index method as the one used in the query.
// Here we use L2 distance for the index method.
// See: https://txt.cohere.com/introducing-embed-v3/
await client.query(`CREATE INDEX ON items 
                      USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);`);
await client.query(`CREATE INDEX ON items (botid);`);
```

## Search (Query) configuration

Edit [vector_search.py](../backend/app/vector_search.py).

```py
# NOTE: <-> is the KNN by L2 distance in pgvector.
# If you want to use inner product or cosine distance, use <#> or <=> respectively.
# It's important to choose the same distance metric as the one used for indexing.
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

To change the number of chunks for contexts, edit [config.py](../backend/app/config.py).

```py
# Configure search parameter to fetch relevant documents from vector store.
SEARCH_CONFIG = {
    "max_results": 5,
}
```

## Playwright configuration

To change delay seconds to wait for the page to render by Playwright, open [url.py](../backend/embedding/loaders/url.py) and set value for `DELAY_SEC`.

```py
DELAY_SEC = 2
```
