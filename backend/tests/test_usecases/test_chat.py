import sys

sys.path.insert(0, ".")
import unittest
from pprint import pprint

from anthropic.types import MessageStopEvent
from app.bedrock import get_model_id
from app.config import DEFAULT_GENERATION_CONFIG
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
from app.repositories.models.conversation import (
    ContentModel,
    ConversationModel,
    MessageModel,
)
from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Content,
    MessageInput,
    type_model_name,
)
from app.usecases.chat import (
    chat,
    fetch_conversation,
    insert_knowledge,
    prepare_conversation,
    propose_conversation_title,
    trace_to_root,
)
from app.utils import get_anthropic_client
from app.vector_search import SearchResult
from tests.test_usecases.utils.bot_factory import (
    create_test_instruction_template,
    create_test_private_bot,
    create_test_public_bot,
)

MODEL: type_model_name = "claude-instant-v1"
MISTRAL_MODEL: type_model_name = "mistral-7b-instruct"


class TestTraceToRoot(unittest.TestCase):
    def test_trace_to_root(self):
        message_map = {
            "user_1": MessageModel(
                role="user",
                content=[
                    ContentModel(content_type="text", body="user_1", media_type=None)
                ],
                model=MODEL,
                children=["bot_1"],
                parent=None,
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
            "bot_1": MessageModel(
                role="assistant",
                content=[
                    ContentModel(content_type="text", body="bot_1", media_type=None)
                ],
                model=MODEL,
                children=["user_2"],
                parent="user_1",
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
            "user_2": MessageModel(
                role="user",
                content=[
                    ContentModel(content_type="text", body="user_2", media_type=None)
                ],
                model=MODEL,
                children=["bot_2"],
                parent="bot_1",
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
            "bot_2": MessageModel(
                role="assistant",
                content=[
                    ContentModel(content_type="text", body="bot_2", media_type=None)
                ],
                model=MODEL,
                children=["user_3a", "user_3b"],
                parent="user_2",
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
            "user_3a": MessageModel(
                role="user",
                content=[
                    ContentModel(content_type="text", body="user_3a", media_type=None)
                ],
                model=MODEL,
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
            "user_3b": MessageModel(
                role="user",
                content=[
                    ContentModel(content_type="text", body="user_3b", media_type=None)
                ],
                model=MODEL,
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            ),
        }
        messages = trace_to_root("user_3a", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content[0].body, "user_1")
        self.assertEqual(messages[1].content[0].body, "bot_1")
        self.assertEqual(messages[2].content[0].body, "user_2")
        self.assertEqual(messages[3].content[0].body, "bot_2")
        self.assertEqual(messages[4].content[0].body, "user_3a")

        messages = trace_to_root("user_3b", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content[0].body, "user_1")
        self.assertEqual(messages[1].content[0].body, "bot_1")
        self.assertEqual(messages[2].content[0].body, "user_2")
        self.assertEqual(messages[3].content[0].body, "bot_2")
        self.assertEqual(messages[4].content[0].body, "user_3b")


class TestStartChat(unittest.TestCase):
    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="あなたの名前は何ですか？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
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
        self.assertNotEqual(conv.total_price, 0)

    def test_chat_mistral(self):
        prompt = "あなたの名前は何ですか?"
        body = f"<s>[INST]{prompt}[/INST]"

        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body=body,
                        media_type=None,
                    )
                ],
                model=MISTRAL_MODEL,
                parent_message_id=None,
                message_id=None,
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
        self.assertNotEqual(conv.total_price, 0)

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestMultimodalChat(unittest.TestCase):
    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)

    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="Explain the image",
                        media_type=None,
                    ),
                    Content(
                        content_type="image",
                        # AWS Logo image
                        body="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",
                        media_type="image/png",
                    ),
                ],
                model="claude-v3-sonnet",  # Specify v3 model
                parent_message_id=None,
                message_id=None,
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        # Check the output whether the explanation is about aws logo
        pprint(output.model_dump())
        self.output = output


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
                total_price=0,
                message_map={
                    "1-user": MessageModel(
                        role="user",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="こんにちは",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=["1-assistant"],
                        parent=None,
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                    "1-assistant": MessageModel(
                        role="assistant",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="はい、こんにちは。どうしましたか?",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=[],
                        parent="1-user",
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="あなたの名前は？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id="1-assistant",
                message_id=None,
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
                total_price=0,
                message_map={
                    "a-1": MessageModel(
                        role="user",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="こんにちはを英語で",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=["a-2"],
                        parent=None,
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                    "a-2": MessageModel(
                        role="assistant",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="Hello!",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=[],
                        parent="a-1",
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                    "b-1": MessageModel(
                        role="user",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="こんにちはを中国語で",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=["b-2"],
                        parent=None,
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                    "b-2": MessageModel(
                        role="assistant",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="你好!",
                                media_type=None,
                            )
                        ],
                        model=MODEL,
                        children=[],
                        parent="b-1",
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="では、おやすみなさいはなんと言う？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="a-2",
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="では、おやすみなさいはなんと言う？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="b-2",
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        # body="Australian famous site seeing place",
                        body="日本の有名な料理を3つ教えて",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
            ),
            bot_id=None,
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        print(output)
        self.output = output

        chat_input.message.model = MISTRAL_MODEL
        mistral_output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.mistral_output = mistral_output
        print(mistral_output)

    def test_propose_title(self):
        title = propose_conversation_title("user1", self.output.conversation_id)
        print(f"[title]: {title}")

    def test_propose_title_mistral(self):
        title = propose_conversation_title("user1", self.mistral_output.conversation_id)
        print(f"[title]: {title}")

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestChatWithCustomizedBot(unittest.TestCase):
    first_user_id = "user1"
    second_user_id = "user2"

    first_private_bot_id = "private1"
    first_public_bot_id = "public1"

    def setUp(self) -> None:
        private_bot = create_test_private_bot(
            self.first_private_bot_id,
            True,
            self.first_user_id,
            create_test_instruction_template("俺様風の口調で"),
            "SUCCEEDED",
        )
        public_bot = create_test_public_bot(
            self.first_public_bot_id,
            True,
            self.second_user_id,
            self.first_public_bot_id,
            create_test_instruction_template("大阪弁で"),
        )
        store_bot(self.first_user_id, private_bot)
        store_bot(self.second_user_id, public_bot)
        update_bot_visibility(self.second_user_id, self.first_public_bot_id, True)

    def tearDown(self) -> None:
        delete_bot_by_id(self.first_user_id, self.first_private_bot_id)
        delete_bot_by_id(self.second_user_id, self.first_public_bot_id)
        delete_conversation_by_user_id(self.first_user_id)

    def test_chat_with_private_bot(self):
        # First message
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="こんにちは",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
            ),
            bot_id="private1",
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        print(output)

        conv = find_conversation_by_id("user1", output.conversation_id)
        self.assertEqual(len(conv.message_map["system"].children), 1)
        self.assertEqual(conv.message_map["system"].children, ["instruction"])
        self.assertEqual(len(conv.message_map["instruction"].children), 1)

        # Second message
        chat_input = ChatInput(
            conversation_id=conv.id,
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="自己紹介して",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=conv.last_message_id,
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="こんばんは",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id="system",
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="こんにちは",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="自己紹介して",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=conv.last_message_id,
                message_id=None,
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
                content=[
                    Content(
                        content_type="text",
                        body="君の名は？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
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
            total_price=0,
            message_map={
                "instruction": MessageModel(
                    role="bot",
                    content=[
                        ContentModel(
                            content_type="text",
                            body=create_test_instruction_template("俺様風の口調で"),
                            media_type=None,
                        )
                    ],
                    model=MODEL,
                    children=["1-user"],
                    parent=None,
                    create_time=1627984879.9,
                    feedback=None,
                    used_chunks=None,
                ),
                "1-user": MessageModel(
                    role="user",
                    content=[
                        ContentModel(
                            content_type="text",
                            body="Serverlessのメリットを説明して",
                            media_type=None,
                        )
                    ],
                    model=MODEL,
                    children=[],
                    parent="instruction",
                    create_time=1627984879.9,
                    feedback=None,
                    used_chunks=None,
                ),
            },
            bot_id="bot1",
            last_message_id="1-user",
        )
        conversation_with_context = insert_knowledge(
            conversation, results, display_citation=True
        )
        print(conversation_with_context.message_map["instruction"])


class TestStreamingApi(unittest.TestCase):
    def test_streaming_api(self):
        client = get_anthropic_client()
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="あなたの名前は何ですか？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
            ),
            bot_id=None,
        )
        user_msg_id, conversation, bot = prepare_conversation("user1", chat_input)
        messages = trace_to_root(
            node_id=chat_input.message.parent_message_id,
            message_map=conversation.message_map,
        )
        messages.append(chat_input.message)  # type: ignore
        args = {
            **DEFAULT_GENERATION_CONFIG,
            "model": get_model_id(chat_input.message.model),
            "messages": [
                {"role": message.role, "content": message.content[0].body}
                for message in messages
                if message.role not in ["system", "instruction"]
            ],
            "stream": True,
        }
        response = client.messages.create(**args)
        for event in response:
            # print(event)
            if isinstance(event, (MessageStopEvent)):
                print(event)
                metrics = event.model_dump()["amazon-bedrock-invocationMetrics"]
                input_token_count = metrics.get("inputTokenCount")
                output_token_count = metrics.get("outputTokenCount")
                print(input_token_count, output_token_count)


if __name__ == "__main__":
    unittest.main()
