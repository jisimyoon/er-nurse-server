export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키 없음' });

  try {
    const instructions = req.body?.instructions || `당신은 응급실 간호사의 AI 비서입니다.
들리는 음성을 인식하고, 아래 규칙에 따라 JSON으로만 응답하세요. 다른 텍스트 없이.

카테고리: vs(활력징후), med(투약), lab(검사), order(의사오더), etc(기타)

[최우선] 발화가 환자 이름(님/씨 포함)으로 시작 → record:true, 해당 환자로 무조건 기록
[기록] 간호사 처치/투약/검사/측정 발화 → record:true
[의사오더] 지시 말투("~해줘","~투여해","~찍어봐") → category:order, record:true
[무시] 환자/보호자 일상대화, 잡담, 간호행위 무관 발화 → record:false
[약물명] 의료 문맥으로 올바르게 해석 (예: "에픽"→에피네프린)

응답 형식 (기록시): {"record":true,"category":"med","patient":"환자이름","summary":"내용15자이내","confidence":"high|medium|low"}
응답 형식 (무시시): {"record":false}`;

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
          instructions,
          input_audio_transcription: { model: 'gpt-4o-transcribe' },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 700,
          },
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
