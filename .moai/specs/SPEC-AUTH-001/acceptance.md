# SPEC-AUTH-001: 인수 기준

## TAG BLOCK

```
TAG: SPEC-AUTH-001
생성일: 2025-01-14
상태: Planned
우선순위: High
담당자: TBD
```

## 테스트 시나리오 (Given-When-Then Format)

### AC1. 회원가입 성공

**Scenario: AC1.1 - 유효한 정보로 회원가입**

```gherkin
GIVEN 사용자가 회원가입 페이지에 접근하고
AND 데이터베이스에 입력된 이메일이 존재하지 않을 때
WHEN 사용자가 유효한 이메일과 비밀번호를 입력하고
AND 비밀번호 확인이 비밀번호와 일치하고
AND 회원가입 버튼을 클릭하면
THEN 시스템은 새로운 사용자 계정을 생성하고
AND 데이터베이스에 사용자 정보를 저장하고
AND 비밀번호는 해싱되어 저장되고
AND 사용자를 로그인 페이지로 리다이렉트하고
AND 성공 메시지를 표시한다
```

### AC2. 회원가입 실패 - 중복 이메일

**Scenario: AC2.1 - 이미 존재하는 이메일로 회원가입 시도**

```gherkin
GIVEN 사용자가 회원가입 페이지에 접근하고
AND 데이터베이스에 입력된 이메일이 이미 존재할 때
WHEN 사용자가 존재하는 이메일과 비밀번호를 입력하고
AND 회원가입 버튼을 클릭하면
THEN 시스템은 새로운 계정을 생성하지 않고
AND "이미 존재하는 이메일입니다" 오류 메시지를 표시하고
AND 회원가입 페이지에 머문다
```

### AC3. 회원가입 실패 - 비밀번호 유효성 검사

**Scenario: AC3.1 - 비밀번호가 8자 미만**

```gherkin
GIVEN 사용자가 회원가입 페이지에 접근할 때
WHEN 사용자가 7자 이하의 비밀번호를 입력하고
AND 회원가입 버튼을 클릭하면
THEN 시스템은 계정을 생성하지 않고
AND "비밀번호는 8자 이상이어야 합니다" 오류 메시지를 표시한다
```

**Scenario: AC3.2 - 비밀번호 확인 불일치**

```gherkin
GIVEN 사용자가 회원가입 페이지에 접근할 때
WHEN 사용자가 비밀번호와 다른 비밀번호 확인을 입력하고
AND 회원가입 버튼을 클릭하면
THEN 시스템은 계정을 생성하지 않고
AND "비밀번호가 일치하지 않습니다" 오류 메시지를 표시한다
```

### AC4. 로그인 성공

**Scenario: AC4.1 - 올바른 자격증명으로 로그인**

```gherkin
GIVEN 사용자가 로그인 페이지에 접근하고
AND 데이터베이스에 입력된 이메일이 존재하고
AND 입력된 비밀번호가 저장된 비밀번호와 일치할 때
WHEN 사용자가 이메일과 비밀번호를 입력하고
AND 로그인 버튼을 클릭하면
THEN 시스템은 사용자를 인증하고
AND 세션을 생성하고
AND 사용자를 대시보드 페이지로 리다이렉트한다
```

### AC5. 로그인 실패

**Scenario: AC5.1 - 존재하지 않는 이메일로 로그인 시도**

```gherkin
GIVEN 사용자가 로그인 페이지에 접근하고
AND 데이터베이스에 입력된 이메일이 존재하지 않을 때
WHEN 사용자가 이메일과 비밀번호를 입력하고
AND 로그인 버튼을 클릭하면
THEN 시스템은 사용자를 인증하지 않고
AND "존재하지 않는 이메일입니다" 오류 메시지를 표시하고
AND 로그인 페이지에 머문다
```

**Scenario: AC5.2 - 올바르지 않은 비밀번호로 로그인 시도**

```gherkin
GIVEN 사용자가 로그인 페이지에 접근하고
AND 데이터베이스에 입력된 이메일이 존재하지만
AND 입력된 비밀번호가 저장된 비밀번호와 일치하지 않을 때
WHEN 사용자가 이메일과 비밀번호를 입력하고
AND 로그인 버튼을 클릭하면
THEN 시스템은 사용자를 인증하지 않고
AND "비밀번호가 올바르지 않습니다" 오류 메시지를 표시하고
AND 로그인 페이지에 머문다
```

### AC6. 로그아웃

**Scenario: AC6.1 - 로그인된 사용자가 로그아웃**

```gherkin
GIVEN 사용자가 로그인되어 있을 때
WHEN 사용자가 로그아웃 버튼을 클릭하면
THEN 시스템은 세션을 종료하고
AND 사용자를 로그인 페이지로 리다이렉트한다
```

### AC7. 세션 보호

**Scenario: AC7.1 - 인증되지 않은 사용자가 보호된 페이지 접근 시도**

```gherkin
GIVEN 사용자가 로그인되어 있지 않을 때
WHEN 사용자가 보호된 페이지(대시보드)에 접근하려고 하면
THEN 시스템은 사용자를 로그인 페이지로 리다이렉트하고
AND 접근하려던 페이지 URL을 리다이렉트 파라미터로 저장한다
```

**Scenario: AC7.2 - 로그인 후 원래 페이지로 리다이렉트**

```gherkin
GIVEN 사용자가 로그인되어 있지 않고
AND 사용자가 보호된 페이지에 접근하려고 리다이렉트되었을 때
WHEN 사용자가 성공적으로 로그인하면
THEN 시스템은 사용자를 원래 접근하려던 페이지로 리다이렉트한다
```

### AC8. 보안 요구사항

**Scenario: AC8.1 - 비밀번호 평문 저장 금지**

```gherkin
GIVEN 데이터베이스에 사용자 정보가 저장될 때
THEN 비밀번호는 평문이 아닌 해싱된 형태로 저장된다
AND 해싱 알고리즘은 bcrypt를 사용한다
```

**Scenario: AC8.2 - 로그에 비밀번호 노출 금지**

```gherkin
GIVEN 회원가입 또는 로그인 요청이 처리될 때
THEN 비밀번호 정보는 어떤 로그에도 출력되지 않는다
```

**Scenario: AC8.3 - 세션 ID URL 포함 금지**

```gherkin
GIVEN 사용자 세션이 생성될 때
THEN 세션 ID는 URL에 포함되지 않고
AND HTTP-only 쿠키에 저장된다
```

### AC9. 입력 유효성 검사

**Scenario: AC9.1 - 잘못된 이메일 형식**

```gherkin
GIVEN 사용자가 회원가입 또는 로그인 페이지에 접근할 때
WHEN 사용자가 잘못된 이메일 형식을 입력하면
THEN 시스템은 즉시 "유효한 이메일 형식이 아닙니다" 메시지를 표시한다
```

**Scenario: AC9.2 - 빈 필드 제출**

```gherkin
GIVEN 사용자가 회원가입 또는 로그인 페이지에 접근할 때
WHEN 사용자가 빈 이메일 또는 비밀번호 필드로 제출하면
THEN 시스템은 필수 항목을 입력하라는 메시지를 표시한다
```

## 품질 게이트 (Quality Gates)

### QG1. 테스트 커버리지

- **기준**: 전체 코드의 85% 이상 테스트 커버리지
- **측정 도구**: Vitest Coverage
- **통과 기준**: Coverage 리포트에서 85% 이상 확인

### QG2. 린팅

- **기준**: ESLint 경겨 0개
- **측정 도구**: ESLint
- **통과 기준**: `npm run lint` 실행 시 에러/경고 없음

### QG3. 타입 안전성

- **기준**: TypeScript 타입 에러 0개
- **측정 도구**: tsc --noEmit
- **통과 기준**: 타입 체크 통과

### QG4. 보안 검사

- **기준**: OWASP Top 10 취약점 없음
- **측정 도구**: expert-security 에이전트
- **통과 기준**: 보안 검토 통과

### QG5. 성능 기준

- **회원가입 API 응답 시간**: 500ms 이하 (P95)
- **로그인 API 응답 시간**: 300ms 이하 (P95)
- **페이지 로드 시간**: 2초 이하 (P95)

## 검증 방법 및 도구

### 단위 테스트 (Unit Tests)

**대상:**
- 서비스 계층 함수 (hashPassword, verifyPassword)
- 유효성 검사 함수
- 비즈니스 로직

**도구:**
- Vitest
- Testing Library

**예시:**
```typescript
describe('hashPassword', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'testPassword123!'
    const hashed = await hashPassword(password)
    expect(hashed).not.toBe(password)
    expect(hashed.length).toBeGreaterThan(0)
  })
})
```

### 통합 테스트 (Integration Tests)

**대상:**
- API 라우트
- 데이터베이스 상호작용
- NextAuth.js 통합

**도구:**
- Vitest
- MSW (Mock Service Worker)

**예시:**
```typescript
describe('POST /api/auth/register', () => {
  it('should create new user with valid data', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123!',
        confirmPassword: 'password123!'
      })
    })
    expect(response.status).toBe(200)
  })
})
```

### E2E 테스트 (End-to-End Tests)

**대상:**
- 전체 사용자 플로우
- UI 상호작용

**도구:**
- Playwright
- Testing Library

**예시:**
```typescript
test('user can register and login', async ({ page }) => {
  // 회원가입
  await page.goto('/register')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123!')
  await page.fill('input[name="confirmPassword"]', 'password123!')
  await page.click('button[type="submit"]')

  // 로그인 페이지 리다이렉트 확인
  await expect(page).toHaveURL('/login')

  // 로그인
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123!')
  await page.click('button[type="submit"]')

  // 대시보드 리다이렉트 확인
  await expect(page).toHaveURL('/dashboard')
})
```

## Definition of Done

**완료 정의:**

1. **기능 완료**: 모든 EARS 요구사항 구현 완료
2. **테스트 통과**: 모든 테스트 시나리오 통과
3. **커버리지**: 85% 이상 테스트 커버리지 달성
4. **코드 품질**: ESLint, Prettier 통과
5. **타입 안전성**: TypeScript 타입 체크 통과
6. **보안 검토**: expert-security 승인
7. **문서화**: API 문서 완료
8. **배포 준비**: 프로덕션 배포 가능 상태

---

**버전**: 1.0.0
**최종 업데이트**: 2025-01-14
**다음 단계**: `/moai:2-run SPEC-AUTH-001`
