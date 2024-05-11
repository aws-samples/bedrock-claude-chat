import json
from os import path, environ

print("## Copying the Generation Config from python backend to be used in the frontend in the build environment")

PROJECT_ROOT = path.join(path.dirname(path.abspath(__file__)), '..')
CONFIG_FILE_PATH = path.join(PROJECT_ROOT, '..', 'backend', 'app', 'config.py')
OUTPUT_CONFIG_DIR = path.join(PROJECT_ROOT, 'src', 'constants')

OUTPUT_DEFAULT_GENERATION_CONFIG = path.join(OUTPUT_CONFIG_DIR, 'defaultGenerationConfig.json')

enableMistral = environ.get('VITE_APP_ENABLE_MISTRAL', 'false') == 'true'

exec(open(CONFIG_FILE_PATH).read())
out_file = open(OUTPUT_DEFAULT_GENERATION_CONFIG, "w") 
generationConfig = MISTRAL_GENERATION_CONFIG if enableMistral else GENERATION_CONFIG
json.dump(generationConfig, out_file, indent=4)

print(f"## the Generation Config is located at {OUTPUT_DEFAULT_GENERATION_CONFIG}")

