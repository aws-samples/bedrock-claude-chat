import sys
import unittest
from unittest.mock import MagicMock, patch

sys.path.insert(0, ".")

from app.repositories.knowledge_base import list_knowledge_bases
from app.routes.schemas.knowledge_base import KnowledgeBaseListItem


class TestKnowledgeBaseRepository(unittest.TestCase):
    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_success_single_page(self, mock_get_client):
        """Test successful listing of knowledge bases with single page of results"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock single page response
        mock_paginator.paginate.return_value = [
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB123",
                        "name": "Test KB 1",
                        "description": "First test knowledge base",
                        "status": "ACTIVE",
                    },
                    {
                        "knowledgeBaseId": "KB456",
                        "name": "Test KB 2",
                        "description": "Second test knowledge base",
                        "status": "CREATING",
                    },
                ]
            }
        ]

        # Execute
        result = list_knowledge_bases()

        # Assert
        self.assertEqual(len(result), 2)
        self.assertIsInstance(result[0], KnowledgeBaseListItem)
        self.assertEqual(result[0].knowledge_base_id, "KB123")
        self.assertEqual(result[0].name, "Test KB 1")
        self.assertEqual(result[0].description, "First test knowledge base")
        self.assertEqual(result[0].status, "ACTIVE")
        self.assertEqual(result[1].knowledge_base_id, "KB456")
        self.assertEqual(result[1].name, "Test KB 2")
        self.assertEqual(result[1].status, "CREATING")

        # Verify client was called correctly
        mock_client.get_paginator.assert_called_once_with("list_knowledge_bases")

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_success_multiple_pages(self, mock_get_client):
        """Test successful listing with pagination across multiple pages"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock multiple pages
        mock_paginator.paginate.return_value = [
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB001",
                        "name": "KB Page 1 - Item 1",
                        "description": "Description 1",
                        "status": "ACTIVE",
                    },
                    {
                        "knowledgeBaseId": "KB002",
                        "name": "KB Page 1 - Item 2",
                        "description": "Description 2",
                        "status": "ACTIVE",
                    },
                ]
            },
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB003",
                        "name": "KB Page 2 - Item 1",
                        "description": "Description 3",
                        "status": "UPDATING",
                    },
                ]
            },
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB004",
                        "name": "KB Page 3 - Item 1",
                        "description": "Description 4",
                        "status": "DELETING",
                    },
                    {
                        "knowledgeBaseId": "KB005",
                        "name": "KB Page 3 - Item 2",
                        "description": "Description 5",
                        "status": "ACTIVE",
                    },
                ]
            },
        ]

        # Execute
        result = list_knowledge_bases()

        # Assert - should aggregate all pages
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0].knowledge_base_id, "KB001")
        self.assertEqual(result[2].knowledge_base_id, "KB003")
        self.assertEqual(result[4].knowledge_base_id, "KB005")

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_empty_results(self, mock_get_client):
        """Test handling of empty results"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock empty response
        mock_paginator.paginate.return_value = [{"knowledgeBaseSummaries": []}]

        # Execute
        result = list_knowledge_bases()

        # Assert
        self.assertEqual(len(result), 0)
        self.assertIsInstance(result, list)

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_missing_optional_fields(self, mock_get_client):
        """Test handling of KB entries with missing optional fields"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock response with missing optional fields
        mock_paginator.paginate.return_value = [
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB789",
                        "name": "Minimal KB",
                        # No description
                        "status": "ACTIVE",
                    },
                    {
                        "knowledgeBaseId": "KB000",
                        "name": "KB without status",
                        "description": "Has description but no status",
                        # No status - should default to "UNKNOWN"
                    },
                ]
            }
        ]

        # Execute
        result = list_knowledge_bases()

        # Assert
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].knowledge_base_id, "KB789")
        self.assertEqual(result[0].name, "Minimal KB")
        self.assertIsNone(result[0].description)
        self.assertEqual(result[0].status, "ACTIVE")

        self.assertEqual(result[1].knowledge_base_id, "KB000")
        self.assertEqual(result[1].description, "Has description but no status")
        self.assertEqual(result[1].status, "UNKNOWN")

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_api_error(self, mock_get_client):
        """Test error handling when Bedrock API call fails"""
        # Setup mock client to raise an exception
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.side_effect = Exception(
            "Bedrock API connection failed"
        )

        # Execute
        result = list_knowledge_bases()

        # Assert - should return empty list on error
        self.assertEqual(result, [])
        self.assertIsInstance(result, list)

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_pagination_error(self, mock_get_client):
        """Test error handling when pagination fails mid-iteration"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock paginator that raises exception during iteration
        mock_paginator.paginate.side_effect = Exception("Pagination failed")

        # Execute
        result = list_knowledge_bases()

        # Assert - should return empty list on error
        self.assertEqual(result, [])
        self.assertIsInstance(result, list)

    @patch("app.repositories.knowledge_base.logger")
    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_logging_success(self, mock_get_client, mock_logger):
        """Test that successful execution logs the count"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        mock_paginator.paginate.return_value = [
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": "KB1",
                        "name": "Test",
                        "status": "ACTIVE",
                    }
                ]
            }
        ]

        # Execute
        result = list_knowledge_bases()

        # Assert logging
        mock_logger.info.assert_called_once_with("Found 1 knowledge bases")
        self.assertEqual(len(result), 1)

    @patch("app.repositories.knowledge_base.logger")
    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_logging_error(self, mock_get_client, mock_logger):
        """Test that errors are logged properly"""
        # Setup mock client to raise exception
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        error_message = "Test API error"
        mock_client.get_paginator.side_effect = Exception(error_message)

        # Execute
        result = list_knowledge_bases()

        # Assert logging and return value
        self.assertEqual(result, [])
        mock_logger.error.assert_called_once()
        # Check that the error message contains our exception
        call_args = mock_logger.error.call_args[0][0]
        self.assertIn("Failed to list knowledge bases", call_args)

    @patch("app.repositories.knowledge_base.get_bedrock_agent_client")
    def test_list_knowledge_bases_field_mapping(self, mock_get_client):
        """Test correct mapping of API response fields to schema"""
        # Setup mock client and paginator
        mock_client = MagicMock()
        mock_paginator = MagicMock()
        mock_get_client.return_value = mock_client
        mock_client.get_paginator.return_value = mock_paginator

        # Mock response with all fields
        test_id = "TEST-KB-12345"
        test_name = "Production Knowledge Base"
        test_desc = "Contains production documentation and FAQs"
        test_status = "ACTIVE"

        mock_paginator.paginate.return_value = [
            {
                "knowledgeBaseSummaries": [
                    {
                        "knowledgeBaseId": test_id,
                        "name": test_name,
                        "description": test_desc,
                        "status": test_status,
                    }
                ]
            }
        ]

        # Execute
        result = list_knowledge_bases()

        # Assert field mapping
        self.assertEqual(len(result), 1)
        kb = result[0]
        self.assertEqual(kb.knowledge_base_id, test_id)
        self.assertEqual(kb.name, test_name)
        self.assertEqual(kb.description, test_desc)
        self.assertEqual(kb.status, test_status)


# (Remove lines 310-342 entirely)
if __name__ == "__main__":
    unittest.main()
