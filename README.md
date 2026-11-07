# 매출 대시보드

이 프로젝트는 Google Sheets의 공개 CSV를 읽어서 웹페이지 형태의 매출 대시보드를 보여줍니다.

## 사용 방법

1. `index.html`을 브라우저에서 열기
2. 데이터 시트 URL이 맞는지 확인
3. 필요하면 컬럼명을 수정해 데이터 구조에 맞게 맞춤

## GitHub Pages 배포

GitHub 저장소에서 Settings → Pages → Deploy from a branch 로 설정 후, `main` 브랜치의 루트 디렉토리를 선택하면 됩니다.

## 주요 파일

- `index.html` : 대시보드 레이아웃
- `style.css` : 스타일
- `script.js` : CSV 로딩 및 차트 계산

## 데이터 구조 예시

- 날짜
- 담당자
- 매출

CSV 컬럼명은 자동으로 인식하도록 설계돼 있으며, 이름이 조금 달라도 후보 매핑으로 대체할 수 있습니다.
