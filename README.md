# Azure OpenAI Worker

A Cloudflare Worker that proxies OpenAI API requests to Azure OpenAI API, with automatic API version synchronization.

> Why not use OpenAI js SDK?
> I'm stupid :D
> 
> I need to share my Azure OpenAI API key with others and monitor the usage, but I don't want to expose my API key to the public.


## Setup

### 1. Create KV Namespace

```bash
npx wrangler kv:namespace create AZURE_OPENAI_API_KEYS
```

Update `wrangler.toml` with the KV namespace ID:
```toml
[[kv_namespaces]]
binding = "AZURE_OPENAI_API_KEYS"
id = "<your_namespace_id>"
```

### 2. Configure Azure OpenAI Secrets

Set up your Azure OpenAI credentials as secrets:
```bash
wrangler secret put AZURE_ENDPOINT
wrangler secret put AZURE_DEPLOYMENT_ID
wrangler secret put AZURE_API_KEY
```

### 3. Deploy & Generate API Keys

Deploy to Cloudflare:
```bash
bun run deploy
```

Generate and store API keys:
```bash
# Generate keys
python generate_key.py

# Add key to KV store
wrangler kv:key put --binding=AZURE_OPENAI_API_KEYS "<your_api_key>" '{"username": "<username>"}'
```

### 4. Usage

Make requests using the OpenAI API format:
```bash
curl https://<worker-name>.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Plan

- [ ] Add usage monitoring for each API key on Azure Portal