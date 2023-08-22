# Claudeに渡すパラメータの設定をします。
# ご利用のアプリケーションに合わせて調整してください。
# 参考: https://docs.anthropic.com/claude/reference/complete_post
GENERATION_CONFIG = {
    "max_tokens_to_sample": 500,
    "temperature": 0.0,
    "top_k": 250,
    "top_p": 0.999,
    "stop_sequences": ["Human: ", "Assistant: "],
}