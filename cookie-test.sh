#!/bin/bash

# 기본 URL 설정
BASE_URL="http://localhost:3002"

# 테스트용 메모 내용
MEMO="테스트 메모 $(date +%H:%M:%S)"

# 참고: 이 내용은 브라우저에서 직접 쿠키를 복사하여 사용해야 합니다
# 개발자 도구 > 애플리케이션/스토리지 > 쿠키에서 확인 가능
AUTH_COOKIE=""

echo "=========== 1. 테스트 API 호출 (쿠키 없음) ==========="
curl -s "$BASE_URL/api/timelines/test" | jq .
echo

echo "=========== 2. 쿠키 정보 API 호출 ==========="
curl -s "$BASE_URL/api/auth/cookie-test" | jq .
echo

if [ -n "$AUTH_COOKIE" ]; then
  echo "=========== 3. 쿠키를 포함한 테스트 호출 ==========="
  curl -s -H "Cookie: $AUTH_COOKIE" "$BASE_URL/api/timelines/test" | jq .
  echo
  
  echo "=========== 4. 메모 API 호출 ==========="
  curl -s -X PUT \
    -H "Content-Type: application/json" \
    -H "Cookie: $AUTH_COOKIE" \
    -d "{\"memo\":\"$MEMO\"}" \
    "$BASE_URL/api/timelines/4/memo" | jq .
  echo
else
  echo "=========== AUTH_COOKIE가 설정되지 않았습니다 ==========="
  echo "브라우저에서 쿠키를 복사하여 이 스크립트의 AUTH_COOKIE 변수에 설정해주세요."
  echo
fi

echo "=========== 5. 테스트 페이지 사용 권장 ==========="
echo "브라우저에서 http://localhost:3002/test-auth 페이지를 방문하여 로그인 후 테스트하기를 권장합니다." 