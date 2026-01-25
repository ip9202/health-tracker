# Google Cloud Vision API 설정 가이드

## 개요

Google Cloud Vision API를 사용하여 OCR 정확도를 95% → 99%+로 개선합니다. Tesseract.js를 폴백 엔진으로 유지합니다.

## 설정 방법

### 1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. Cloud Vision API 활성화

\`\`\`bash
# gcloud CLI를 사용하는 경우
gcloud services enable vision.googleapis.com
\`\`\`

또는 Console에서:
1. APIs & Services > Library
2. "Vision API" 검색
3. "Enable" 클릭

### 3. 서비스 계정 생성 및 JSON 키 다운로드

1. **IAM & Admin > Service Accounts** 이동
2. **Create Service Account** 클릭
3. 서비스 계정 이름 입력 (예: \`vision-api-client\`)
4. **Roles**에서 \`Cloud Vision API User\` 역할 추가
5. **Create** 클릭
6. 생성된 서비스 계정 클릭 > **Keys** 탭
7. **Add Key > Create new key** > JSON 선택
8. JSON 키 파일 다운로드 (안전한 곳에 보관)

### 4. 환경 변수 설정

#### 옵션 1: Base64 인코딩된 서비스 계정 키 (권장)

\`\`\`bash
# macOS/Linux
cat path/to/service-account-key.json | base64

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\\to\\service-account-key.json"))
\`\`\`

\`.env.local\` 파일에 추가:
\`\`\`bash
GOOGLE_CLOUD_CREDENTIALS="eyJ0eXAiOiJKV1QiLCJhbGc..."
\`\`\`

#### 옵션 2: 서비스 계정 JSON 파일 경로

서비스 계정 JSON 키를 프로젝트 루트에 복사:
\`\`\`bash
cp ~/Downloads/service-account-key.json ./google-credentials.json
\`\`\`

\`.env.local\` 파일에 추가:
\`\`\`bash
GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"
\`\`\`

### 5. .gitignore 확인

보안상 서비스 계정 키 파일이 Git에 커밋되지 않도록 확인:

\`\`\`gitignore
# Google Cloud
google-credentials.json
*.json
!package.json
\`\`\`

## 사용 방법

\`\`\`typescript
import { extractTextFromImage } from '@/lib/ocr-service';

// Google Vision API 우선 사용 (자동 폴백)
const result = await extractTextFromImage('data:image/png;base64,...');

console.log(result.text);       // 추출된 텍스트
console.log(result.confidence);  // 신뢰도 (0-100)
console.log(result.engine);      // 'google-vision' 또는 'tesseract'
\`\`\`

## 옵션

\`\`\`typescript
// Google Vision API 비활성화 (Tesseract만 사용)
const result = await extractTextFromImage(imagePath, {
  useGoogleVision: false,
});

// 폴백 비활성화 (Google Vision만 사용)
const result = await extractTextFromImage(imagePath, {
  enableFallback: false,
});

// 타임아웃 및 재시도 설정
const result = await extractTextFromImage(imagePath, {
  timeout: 60000,     // 60초
  maxRetries: 3,      // 최대 3번 재시도
  minConfidence: 80,  // 최소 신뢰도 80%
});
\`\`\`

## 비용 고려사항

- **Cloud Vision API**: 1,000건/month 무료, 이후 $1.50/1,000건
- **Tesseract.js**: 완전 무료
- **권장**: 개발 환경에서는 Tesseract만 사용, 프로덕션에서 Google Vision 활성화

## 문제 해결

### 인증 오류
\`\`\`
Error: Google Cloud 인증 실패
\`\`\`
- 서비스 계정 키가 올바른지 확인
- 환경 변수가 정확히 설정되었는지 확인

### 타임아웃
\`\`\`
Error: Google Vision API timeout
\`\`\`
- \`timeout\` 옵션 증가 (기본값: 30초)
- 이미지 크기 확인 (최대 10MB 권장)

### Tesseract만 사용됨
- \`GOOGLE_CLOUD_CREDENTIALS\` 환경 변수 확인
- Google Cloud Vision API 활성화 확인
