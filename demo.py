import requests
import json

API_URL = "https://asia-south1.api.boltic.io/service/webhook/temporal/v1.0/97613e6f-451c-4183-8aad-7ace0748086a/workflows/execute/c71f5b89-eee8-47c1-bcf7-68f7b54c51c2"

params = {}
headers = {
    "Content-Type": "application/json"
}

json_data = {}
response = requests.post(
    API_URL,
    json=json_data, headers=headers
)

if response.status_code == 200:
    api_response = response.json()
else:
    api_response = f"Request failed with status code {response.status_code}: {response.text}"

print(api_response)