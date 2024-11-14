import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { StatusCode } from 'hono/utils/http-status'

type Bindings = {
  AZURE_OPENAI_API_KEYS: KVNamespace
  AZURE_ENDPOINT: string
  AZURE_DEPLOYMENT_ID: string
  AZURE_API_KEY: string
  AZURE_API_VERSION: string
}

interface UserInfo {
  username: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

app.post('/chat/completions', async (c) => {
  const apiKey = c.req.header('Authorization')?.split(' ')[1]
  if (!apiKey) {
    return c.json({ error: 'missing api key' }, 401)
  }

  // if apikey is not in kv, return 401
  // azure_openai_api_keys kv stores user info in json format, like {"username":"xxx"}
  // get user info from kv, used for monitoring user request
  // details see https://github.com/Azure/azure-rest-api-specs/blob/533d972b32b91774f13e5b56190ab6573760ee85/specification/cognitiveservices/data-plane/AzureOpenAI/inference/stable/2024-10-21/inference.json#L1457
  const userInfo = await c.env.AZURE_OPENAI_API_KEYS.get<UserInfo>(apiKey, {
    type: "json"
  })
  if (!userInfo || !userInfo.username) {
    return c.json({ error: 'invalid api key' }, 401)
  }

  const headers = new Headers(c.req.raw.headers)
  headers.delete('Authorization')
  headers.set('api-key', c.env.AZURE_API_KEY)

  const body = await c.req.json()
  body.user = 'user-' + userInfo.username

  const url = 'https://' + c.env.AZURE_ENDPOINT + '/openai/deployments/' + c.env.AZURE_DEPLOYMENT_ID + '/chat/completions?api-version=' + c.env.AZURE_API_VERSION

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  console.log("request user:", userInfo.username, "status:", response.status)

  if (!response.ok) {
    const errorData = await response.json()
    return c.json({ error: errorData }, response.status as StatusCode)
  }

  return response;
})

export default app
