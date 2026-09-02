# Lumine

**lumis eterne - 당신의 영원한 빛**

## 당신의 우울이 별이 되는 곳, Lumine

밤이 깊을수록 별은 더 선명하게 빛납니다.  
우리 마음속의 우울도 사실은 당신이 가진 가장 깊은 빛일지도 몰라요.

Lumine은 당신에게 `빨리 나아지라`고 재촉하지 않습니다.  
그저 오늘 하루 당신이 머물렀던 감정의 궤적을  
은은한 라벤더 빛으로 감싸 안아줄 뿐입니다.

사라지지 않는 영원한 마음의 빛, **Lumis Eterne**.  
오늘 당신의 조각난 마음들을 이곳에 가만히 내려놓으세요.

## Run All

```bash
cd /Users/hwanghochan/workspace/lumine
npm run dev:all
```

개별 실행:
- `npm run dev:server`
- `npm run dev:metro`
- `npm run dev:ios`
- `npm run dev:android`

## Deploy

스토어 아티팩트:
- `npm run artifact:android`
- `npm run artifact:ios`
- `npm run artifact:app`

루트 기준 커맨드:
- `npm run deploy:server`
- `npm run deploy:all`

GitHub Actions:
- `master` 브랜치 push 시 `.github/workflows/deploy.yml` 실행
- 필요 변수: `AWS_REGION`, `AWS_ACCOUNT_ID`, `EKS_CLUSTER_NAME`, `ECR_SERVER_REPOSITORY`, `K8S_NAMESPACE_SERVER`, `API_HOST`
- 필요 시크릿: `AWS_ROLE_ARN`

## Structure

- `server/`: Spring Boot + Kotlin API 서버
- `app/`: 전체 사용자 경험을 제공하는 React Native 앱

## Notes

- 현재 저장소는 제품 기획, 디자인, 웹, 서버 작업이 함께 진행 중인 상태입니다.
- 디자인 톤앤매너는 `lumis eterne` 브랜딩과 [`docs/designs.md`](docs/designs.md) 기준의 `Moonlight Sanctuary` 디자인 시스템으로 정리합니다.
