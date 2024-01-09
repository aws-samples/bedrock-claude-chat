# RAG (Retrieval Augmented Generation)

In this example, we've implemented the RAG feature using [pgvector](https://github.com/pgvector/pgvector), a PostgreSQL extension that facilitates vector search. We've chosen to run pgvector on [Amazon Aurora Serverless v2](https://aws.amazon.com/rds/aurora/serverless/) due to its cost-effectiveness compared to alternatives like [OpenSearch](https://opensearch.org/) and [Amazon Kendra](https://aws.amazon.com/kendra/), especially when dealing with a smaller user base. This approach allows for a more budget-friendly start.  
Please note that this example implements only simple logic described as following diagram:

![](./imgs/rag.png)

TODO: explain the logic on the above image

If you want to customize parameters, also see: [Configure RAG Parameters](./CONFIGURE_KNOWLEDGE.md).

## RAG by Amazon Kendra

If interested in RAG using [Amazon Kendra](https://aws.amazon.com/kendra/), also refer following samples:

- [generative-ai-use-cases-jp](https://github.com/aws-samples/generative-ai-use-cases-jp) (In Japanese)
- [simple-lex-kendra-jp](https://github.com/aws-samples/simple-lex-kendra-jp) (In Japanese)
- [jp-rag-sample](https://github.com/aws-samples/jp-rag-sample) (In Japanese)
