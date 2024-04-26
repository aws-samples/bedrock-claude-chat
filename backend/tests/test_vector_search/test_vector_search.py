import sys
import unittest

sys.path.append(".")

from app.vector_search import SearchResult, filter_used_results


class TestVectorSearch(unittest.TestCase):
    def test_filter_used_results(self):
        search_results = [
            SearchResult(bot_id="1", content="content1", source="source1", rank=1),
            SearchResult(bot_id="2", content="content2", source="source2", rank=2),
            SearchResult(bot_id="3", content="content3", source="source3", rank=3),
        ]

        generated_text = "This is a test [^1] [^3]"

        used_results = filter_used_results(generated_text, search_results)
        self.assertEqual(len(used_results), 2)
        self.assertEqual(used_results[0].rank, 1)
        self.assertEqual(used_results[1].rank, 3)

    def test_no_reference_filter_used_results(self):
        search_results = [
            SearchResult(bot_id="1", content="content1", source="source1", rank=1),
            SearchResult(bot_id="2", content="content2", source="source2", rank=2),
            SearchResult(bot_id="3", content="content3", source="source3", rank=3),
        ]

        # 4 is not in the search results
        generated_text = "This is a test [^4]"

        used_results = filter_used_results(generated_text, search_results)
        self.assertEqual(len(used_results), 0)

    def test_format_not_match_filter_used_results(self):
        search_results = [
            SearchResult(bot_id="1", content="content1", source="source1", rank=1),
            SearchResult(bot_id="2", content="content2", source="source2", rank=2),
            SearchResult(bot_id="3", content="content3", source="source3", rank=3),
        ]

        # format not match
        generated_text = "This is a test 1 3"

        used_results = filter_used_results(generated_text, search_results)
        self.assertEqual(len(used_results), 0)


if __name__ == "__main__":
    unittest.main()
