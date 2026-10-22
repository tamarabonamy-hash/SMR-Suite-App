import { createClient } from '@/lib/supabase/server'

// Only the models and limits the suite actually uses, so the server key
// can't be used for arbitrary requests.
const ALLOWED_MODELS = ['claude-sonnet-4-5']
const MAX_TOKENS = 4000

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Not signed in' }, { status: 401 })

    const { model, max_tokens, system, messages } = await request.json()
    if (!ALLOWED_MODELS.includes(model)) {
      return Response.json({ error: 'Model not allowed' }, { status: 400 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, system, messages, max_tokens: Math.min(Number(max_tokens) || MAX_TOKENS, MAX_TOKENS) }),
    })

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
