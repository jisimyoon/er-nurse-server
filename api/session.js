
{
  "name": "er-nurse-server",
  "version": "1.0.0",
  "description": "ER Nurse AI - OpenAI Realtime API proxy server",
  "private": true
}

# ER Nurse Server

OpenAI Realtime API 프록시 서버입니다.

## 파일 구조
- `api/session.js` — OpenAI 임시 토큰 발급 API
- `vercel.json` — Vercel 설정

{
  "version": 2,
  "functions": {
    "api/session.js": {
      "memory": 128,
      "maxDuration": 10
    }
  }
}
