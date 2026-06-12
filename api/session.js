export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키 없음' });

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime-2',
          instructions: `당신의 역할은 오직 하나입니다: 사용자가 말하는 내용을 들은 그대로 정확하게 텍스트로 전사하는 것입니다.

절대로 하지 말아야 할 것:
- 사용자가 말하지 않은 내용을 추가하거나 창작하지 마세요
- 대화를 이어가거나 질문에 답하지 마세요
- 내용을 요약하거나 해석하지 마세요
- 어떠한 의견이나 추측도 하지 마세요

반드시 해야 할 것:
- 사용자가 말한 단어를 그대로 전사하세요
- 말하지 않은 것은 절대 기록하지 마세요
- 전사 결과만 출력하세요`,
        }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', response.status, err);
      return res.status(response.status).send(err);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
