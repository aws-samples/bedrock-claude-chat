import json

import boto3

# Definition of supported base models
supported_base_models = {
    "anthropic.claude-opus-4-20250514-v1:0": "claude-v4-opus",
    "anthropic.claude-opus-4-6-v1": "claude-v4.6-opus",
    "anthropic.claude-opus-4-7": "claude-v4.7-opus",
    "anthropic.claude-sonnet-4-20250514-v1:0": "claude-v4-sonnet",
    "anthropic.claude-sonnet-4-6": "claude-v4.6-sonnet",
    "anthropic.claude-3-haiku-20240307-v1:0": "claude-v3-haiku",
    "anthropic.claude-3-opus-20240229-v1:0": "claude-v3-opus",
    "anthropic.claude-3-5-sonnet-20240620-v1:0": "claude-v3.5-sonnet",
    "anthropic.claude-3-5-sonnet-20241022-v2:0": "claude-v3.5-sonnet-v2",
    "anthropic.claude-3-7-sonnet-20250219-v1:0": "claude-v3.7-sonnet",
    "anthropic.claude-3-5-haiku-20241022-v1:0": "claude-v3.5-haiku",
    "mistral.mistral-7b-instruct-v0:2": "mistral-7b-instruct",
    "mistral.mixtral-8x7b-instruct-v0:1": "mixtral-8x7b-instruct",
    "mistral.mistral-large-2402-v1:0": "mistral-large",
    "mistral.mistral-large-2407-v1:0": "mistral-large-2",
    "amazon.nova-pro-v1:0": "amazon-nova-pro",
    "amazon.nova-lite-v1:0": "amazon-nova-lite",
    "amazon.nova-micro-v1:0": "amazon-nova-micro",
    "deepseek.r1-v1:0": "deepseek-r1",
    # Meta Llama 3 models
    "meta.llama3-3-70b-instruct-v1:0": "llama3-3-70b-instruct",
    "meta.llama3-2-1b-instruct-v1:0": "llama3-2-1b-instruct",
    "meta.llama3-2-3b-instruct-v1:0": "llama3-2-3b-instruct",
    "meta.llama3-2-11b-instruct-v1:0": "llama3-2-11b-instruct",
    "meta.llama3-2-90b-instruct-v1:0": "llama3-2-90b-instruct",
}

# Region definitions
regions = {
    # US
    "us-east-1": {"area": "us", "models": []},
    "us-east-2": {"area": "us", "models": []},
    "us-west-2": {"area": "us", "models": []},
    # EU
    "eu-central-1": {"area": "eu", "models": []},
    "eu-west-1": {"area": "eu", "models": []},
    "eu-west-2": {"area": "eu", "models": []},
    "eu-west-3": {"area": "eu", "models": []},
    "eu-north-1": {"area": "eu", "models": []},
    # APAC
    "ap-south-1": {"area": "apac", "models": []},
    "ap-northeast-1": {"area": "apac", "models": []},
    "ap-northeast-2": {"area": "apac", "models": []},
    "ap-northeast-3": {"area": "apac", "models": []},
    "ap-southeast-1": {"area": "apac", "models": []},
    "ap-southeast-2": {"area": "apac", "models": []},
}


def split_inference_profiles_id(inference_profile_id):
    """Split inference_profile_id into area and model"""
    parts = inference_profile_id.split(".")
    area = parts[0]
    model = ".".join(parts[1:])
    return area, model


def list_inference_profiles_for_region(region):
    """Get inference profiles for the specified region"""
    session = boto3.Session()
    client = session.client("bedrock", region_name=region)

    try:
        # API call equivalent to ListInferenceProfilesCommand
        response = client.list_inference_profiles(
            typeEquals="SYSTEM_DEFINED", maxResults=1000
        )
        return response.get("inferenceProfileSummaries", [])
    except Exception as e:
        print(f"Error in region {region}: {e}")
        return []


def main():
    """Main function"""
    for region in regions.keys():
        # Call ListInferenceProfilesCommand API in the region
        profiles = list_inference_profiles_for_region(region)

        for profile in profiles:
            if profile.get("status") == "ACTIVE":
                profileModelId = profile.get("inferenceProfileId", [])
                # Split inference profile
                # For example "us.amazon.nova-pro-v1:0" to ["us", "amazon.nova-pro-v1:0"]
                area, modelId = split_inference_profiles_id(profileModelId)
                if modelId in supported_base_models and area == regions[region]["area"]:
                    model = supported_base_models[modelId]
                    # Append only matched model ids
                    regions[region]["models"].append(model)

        # Sort models
        regions[region]["models"].sort()

    print(json.dumps(regions, indent=4))


if __name__ == "__main__":
    main()
