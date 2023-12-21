import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.repositories.conversation import (
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    store_bot,
    update_bot_visibility,
)
from app.repositories.model import (
    BotModel,
    ContentModel,
    ConversationModel,
    KnowledgeModel,
    MessageModel,
)
from app.route_schema import ChatInput, ChatOutput, Content, MessageInput, MessageOutput
from app.usecases.chat import (
    chat,
    fetch_conversation,
    insert_knowledge,
    propose_conversation_title,
    trace_to_root,
)
from app.vector_search import SearchResult

MODEL = "claude-instant-v1"
# MODEL = "claude-v2"


class TestTraceToRoot(unittest.TestCase):
    def test_trace_to_root(self):
        message_map = {
            "user_1": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_1"),
                model=MODEL,
                children=["bot_1"],
                parent=None,
                create_time=1627984879.9,
            ),
            "bot_1": MessageModel(
                role="assistant",
                content=ContentModel(content_type="text", body="bot_1"),
                model=MODEL,
                children=["user_2"],
                parent="user_1",
                create_time=1627984879.9,
            ),
            "user_2": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_2"),
                model=MODEL,
                children=["bot_2"],
                parent="bot_1",
                create_time=1627984879.9,
            ),
            "bot_2": MessageModel(
                role="assistant",
                content=ContentModel(content_type="text", body="bot_2"),
                model=MODEL,
                children=["user_3a", "user_3b"],
                parent="user_2",
                create_time=1627984879.9,
            ),
            "user_3a": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_3a"),
                model=MODEL,
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
            ),
            "user_3b": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_3b"),
                model=MODEL,
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
            ),
        }
        messages = trace_to_root("user_3a", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content.body, "user_1")
        self.assertEqual(messages[1].content.body, "bot_1")
        self.assertEqual(messages[2].content.body, "user_2")
        self.assertEqual(messages[3].content.body, "bot_2")
        self.assertEqual(messages[4].content.body, "user_3a")

        messages = trace_to_root("user_3b", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content.body, "user_1")
        self.assertEqual(messages[1].content.body, "bot_1")
        self.assertEqual(messages[2].content.body, "user_2")
        self.assertEqual(messages[3].content.body, "bot_2")
        self.assertEqual(messages[4].content.body, "user_3b")


class TestStartChat(unittest.TestCase):
    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの名前は何ですか？",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        self.assertNotEqual(output.conversation_id, "")

        conv = find_conversation_by_id(
            user_id="user1", conversation_id=output.conversation_id
        )
        # Message length will be 2 (system + user input + assistant reply)
        self.assertEqual(len(conv.message_map), 3)
        for k, v in conv.message_map.items():
            if v.parent == "system":
                first_key = k
                first_message = v
            elif v.parent:
                second_key = k
                second_message = v

        self.assertEqual(second_message.parent, first_key)
        self.assertEqual(first_message.children, [second_key])
        self.assertEqual(conv.last_message_id, second_key)

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestContinueChat(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = "user2"
        self.conversation_id = "conversation2"
        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                last_message_id="b-2",
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                message_map={
                    "1-user": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちは",
                        ),
                        model=MODEL,
                        children=["1-assistant"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "1-assistant": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="はい、こんにちは。どうしましたか?",
                        ),
                        model=MODEL,
                        children=[],
                        parent="1-user",
                        create_time=1627984879.9,
                    ),
                },
                bot_id=None,
            ),
        )

    def test_continue_chat(self):
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの名前は？",
                ),
                model=MODEL,
                parent_message_id="1-assistant",
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        conv = find_conversation_by_id(self.user_id, output.conversation_id)

        messages = trace_to_root(conv.last_message_id, conv.message_map)
        self.assertEqual(len(messages), 4)

        num_empty_children = 0
        for k, v in conv.message_map.items():
            if len(v.children) == 0:
                num_empty_children += 1
        self.assertEqual(num_empty_children, 1)

    def tearDown(self) -> None:
        delete_conversation_by_id(self.user_id, self.output.conversation_id)


class TestRegenerateChat(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = "user3"
        self.conversation_id = "conversation3"
        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                last_message_id="b-2",
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                message_map={
                    "a-1": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちはを英語で",
                        ),
                        model=MODEL,
                        children=["a-2"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "a-2": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="Hello!",
                        ),
                        model=MODEL,
                        children=[],
                        parent="a-1",
                        create_time=1627984879.9,
                    ),
                    "b-1": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちはを中国語で",
                        ),
                        model=MODEL,
                        children=["b-2"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "b-2": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="你好!",
                        ),
                        model=MODEL,
                        children=[],
                        parent="b-1",
                        create_time=1627984879.9,
                    ),
                },
                bot_id=None,
            ),
        )

    def test_chat(self):
        # Question for English
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="では、おやすみなさいはなんと言う？",
                ),
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="a-2",
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())  # English
        conv = find_conversation_by_id(self.user_id, output.conversation_id)
        self.assertEqual(len(conv.message_map), 6)

        # Question for Chinese
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="では、おやすみなさいはなんと言う？",
                ),
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="b-2",
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())  # Chinese
        conv = find_conversation_by_id(self.user_id, output.conversation_id)
        self.assertEqual(len(conv.message_map), 8)

    def tearDown(self) -> None:
        delete_conversation_by_id(self.user_id, self.conversation_id)


class TestProposeTitle(unittest.TestCase):
    def setUp(self) -> None:
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    # body="Australian famous site seeing place",
                    body="日本の有名な料理を3つ教えて",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)

        print(output)
        self.output = output

    def test_propose_title(self):
        title = propose_conversation_title("user1", self.output.conversation_id)
        print(f"[title]: {title}")

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestChatWithCustomizedBot(unittest.TestCase):
    def setUp(self) -> None:
        private_bot = BotModel(
            id="private1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="いついかなる時も、俺様風の口調で返答してください。日本語以外の言語は認めません。",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=True,
            public_bot_id=None,
            knowledge=KnowledgeModel(source_urls=[], sitemap_urls=[], filenames=[]),
            sync_status="SUCCEEDED",
            sync_status_reason="",
        )
        public_bot = BotModel(
            id="public1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="いついかなる時も、大阪弁で返答してください。日本語以外の言語は認めません。",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Pinned
            is_pinned=True,
            public_bot_id="public1",
            knowledge=KnowledgeModel(source_urls=[], sitemap_urls=[], filenames=[]),
            sync_status="SUCCEEDED",
            sync_status_reason="",
        )
        store_bot("user1", private_bot)
        store_bot("user2", public_bot)
        update_bot_visibility("user2", "public1", True)

    def tearDown(self) -> None:
        delete_bot_by_id("user1", "private1")
        delete_bot_by_id("user2", "public1")
        delete_conversation_by_user_id("user1")

    def test_chat_with_private_bot(self):
        # First message
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="こんにちは",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        print(output)

        conv = find_conversation_by_id("user1", output.conversation_id)
        self.assertEqual(len(conv.message_map["system"].children), 1)
        self.assertEqual(conv.message_map["system"].children[0], "instruction")
        self.assertEqual(len(conv.message_map["instruction"].children), 1)

        # Second message
        chat_input = ChatInput(
            conversation_id=conv.id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="自己紹介して",
                ),
                model=MODEL,
                parent_message_id=conv.last_message_id,
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        print(output)

        # Edit first message
        chat_input = ChatInput(
            conversation_id=conv.id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="こんばんは",
                ),
                model=MODEL,
                parent_message_id="system",
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)

        conv = find_conversation_by_id("user1", output.conversation_id)
        self.assertEqual(len(conv.message_map["system"].children), 1)
        self.assertEqual(conv.message_map["system"].children[0], "instruction")
        self.assertEqual(len(conv.message_map["instruction"].children), 2)

    def test_chat_with_public_bot(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="こんにちは",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
            bot_id="public1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)

        print(output)

        conv = find_conversation_by_id("user1", output.conversation_id)
        chat_input = ChatInput(
            conversation_id=conv.id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="自己紹介して",
                ),
                model=MODEL,
                parent_message_id=conv.last_message_id,
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        print(output)

        # Delete alias
        delete_alias_by_id("user1", "public1")

    def test_fetch_conversation(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="君の名は？",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)

        conv = fetch_conversation("user1", output.conversation_id)
        # Assert that instruction is not included
        self.assertIsNone(conv.message_map.get("instruction"))

        msg = trace_to_root(conv.last_message_id, conv.message_map)  # type: ignore
        self.assertEqual(len(msg), 3)  # system + user + assistant
        pprint(msg)


class TestInsertKnowledge(unittest.TestCase):
    def test_insert_knowledge(self):
        results = [
            SearchResult(**x)
            for x in [
                {
                    "bot_id": "bot_bb                    ",
                    "content": "73\n\nその他リソース\n\nサービス概要: https://aws.amazon.com/jp/opensearch-service/features/serverless/\n\nよくある質問: https://aws.amazon.com/opensearch-service/faqs/#Serverless\n\n料金: https://aws.amazon.com/opensearch-\n\nservice/pricing/?nc1=h_ls#Amazon_OpenSearch_Serverless\n\nドキュメント: https://docs.aws.amazon.com/opensearch- service/latest/developerguide/serverless.html\n\nOpenSearch Service と OpenSearch Serverless の比較:\n\nhttps://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless- overview.html#serverless-comparison\n\nワークショップ: https://catalog.us-east-1.prod.workshops.aws/workshops/f8d2c175- 634d-4c5d-94cb-d83bbc656c6a\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\n74\n\n本資料に関するお問い合わせ・ご感想\n\n技術的な内容に関しましては、有料のAWSサポート窓口へ お問い合わせください\n\nhttps://aws.amazon.com/jp/premiumsupport/\n\n料金面でのお問い合わせに関しましては、カスタマーサポート窓口へ お問い合わせください（マネジメントコンソールへのログインが必要です）\n\nhttps://console.aws.amazon.com/support/home#/case/create?issueType=customer- service\n\n具体的な案件に対する構成相談は、後述する個別相談会をご活用ください",
                    "source": "https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonOpenSearchServerless_0131_v1.pdf",
                    "rank": 0,
                },
                {
                    "bot_id": "bot_bb                    ",
                    "content": "70\n\nAmazon OpenSearch Serverless がフィットするケース\n\n事前のキャパシティプランニングが困難\n\n一日の間で負荷の変動が激しい\n\n一般的な検索アプリケーション、もしくは小規模 (TiB オーダー) のログ分析が想定用途\n\nノードやクラスターのスケール、セキュリティパッチ適用といった 運用タスクをなるべく削減したい\n\nAmazon OpenSearch Serverless 固有の制限 (API、プラグイン) が利用上の問題にならない\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\n71\n\n従来の Amazon OpenSearch Service がフィットするケース\n\n事前にキャパシティプランニングが可能\n\n一日の間で負荷が一定、もしくは増減の予測が可能\n\n数十 TiB オーダーの大規模なデータから分析や検索を行う 必要がある\n\nベクトル検索やアラート、セキュリティ機能など、 OpenSearch の高度な機能を利用する必要がある\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\n72\n\nまとめ\n\nOpenSearch Serverless は OpenSearch 互換のサーバレスサービスである\n\n負荷に応じて OCU が動的に増減する、自動スケールアウト、スケールインを サポートしている\n\n従来アーキテクチャで行っていたアップデートなどの運用タスクを削減できる\n\nOpenSearch Serverless 固有の制限あり (API、プラグイン、その他機能)\n\n従来の Amazon OpenSearch Service からの移行に際しては、 既存のワークロードや要件を確認し、移行の可能性を検討してから行うこと\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\n73\n\nその他リソース\n\nサービス概要: https://aws.amazon.com/jp/opensearch-service/features/serverless/",
                    "source": "https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonOpenSearchServerless_0131_v1.pdf",
                    "rank": 1,
                },
                {
                    "bot_id": "bot_bb                    ",
                    "content": "67\n\n料金\n\nポイント • OpenSearch Serverless の料金モデルは、\n\n割り当てられたキャパシティユニットに応じた時間課金\n\n料金概要(東京リージョン) • OCU – インデキシング : $0.334 per OCU per hour • OCU – 検索: $0.334 per OCU per hour • マネージドストレージ: $0.026 per GB / month • OpenSearch Dashboards は無料で利用可能\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\nhttps://aws.amazon.com/jp/opensearch-service/pricing/#Amazon_OpenSearch_Serverless\n\n68\n\n主要な制限\n\nアカウント(リージョン)毎の制限 • インデックス可能なデータサイズ : 6 TiB\n\n(超過分のデータはノード上のディスクではなく S3 に格納)\n\nコレクション数: 50 • 検索用 OCU: 50 • インデキシング用 OCU: 50\n\nコレクションごとの制限 • インデックス可能なデータサイズ : 1 TiB\n\n(超過分のデータはノード上のディスクではなく S3 に格納)\n\nインデックス数(検索コレクション): 20 • インデックス数(時系列コレクション): 120\n\n© 2023, Amazon Web Services, Inc. or its affiliates.\n\nhttps://docs.aws.amazon.com/opensearch-service/latest/developerguide/limits.html#limits-serverless\n\n69\n\nまとめ\n\n© 2023, Amazon Web Services, Inc. or its affiliates. © 2023, Amazon Web Services, Inc. or its affiliates.\n\n70\n\nAmazon OpenSearch Serverless がフィットするケース\n\n事前のキャパシティプランニングが困難\n\n一日の間で負荷の変動が激しい",
                    "source": "https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonOpenSearchServerless_0131_v1.pdf",
                    "rank": 2,
                },
            ]
        ]
        conversation = ConversationModel(
            id="conversation1",
            create_time=1627984879.9,
            title="Test Conversation",
            message_map={
                "instruction": MessageModel(
                    role="bot",
                    content=ContentModel(
                        content_type="text",
                        body="いついかなる時も、俺様風の口調で返答してください。日本語以外の言語は認めません。",
                    ),
                    model=MODEL,
                    children=["1-user"],
                    parent=None,
                    create_time=1627984879.9,
                ),
                "1-user": MessageModel(
                    role="user",
                    content=ContentModel(
                        content_type="text",
                        body="Serverlessのメリットを説明して",
                    ),
                    model=MODEL,
                    children=[],
                    parent="instruction",
                    create_time=1627984879.9,
                ),
            },
            bot_id="bot1",
            last_message_id="1-user",
        )
        conversation_with_context = insert_knowledge(conversation, results)
        print(conversation_with_context.message_map["instruction"])


if __name__ == "__main__":
    unittest.main()
