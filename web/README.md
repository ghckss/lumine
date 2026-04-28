# Web

Next.js 기반 웹 앱입니다.

## 요구 사항
- Node.js 18+
- npm 또는 pnpm

## 의존성 설치
```bash
cd /Users/hwanghochan/workspace/melancholy/web
npm install
```

## 개발 서버 실행
```bash
cd /Users/hwanghochan/workspace/melancholy/web
npm run dev
```

## 환경 변수
기본적으로 웹은 아래 서버를 바라봅니다.
- `http://localhost:8080`

다른 서버를 쓰려면 `web/.env.local`을 만듭니다.
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 프로덕션 실행
```bash
cd /Users/hwanghochan/workspace/melancholy/web
npm run build
npm run start
```

## 메모
- 현재 웹은 서버 API와 연동됩니다.
- 감정 일기 저장 후 위로 문구 오버레이를 보여주고 홈으로 이동합니다.
- 질문지는 서버의 `/api/screening/questionnaire` 응답을 그대로 사용합니다.
