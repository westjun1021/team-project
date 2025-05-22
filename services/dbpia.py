# services/dbpia.py

import os, requests, xml.etree.ElementTree as ET
from models.paper import Recommendation, RecommendationResponse

API_KEY = os.getenv("DBPIA_API_KEY")
if not API_KEY:
    raise RuntimeError("DBPIA_API_KEY 환경변수가 설정되지 않았습니다.")

DBPIA_URL = "http://api.dbpia.co.kr/v2/search/search.xml"

def fetch_recommendations(pyear, pmonth, category) -> RecommendationResponse:
    # 1) 파라미터 설정
    params = {"key": API_KEY, "target": "rated_art"}
    if pyear is not None:
        params.update({"pyear": str(pyear), "pmonth": str(pmonth)})
    if category:
        params["category"] = category

    # 2) API 호출
    resp = requests.get(DBPIA_URL, params=params)
    resp.raise_for_status()
    root = ET.fromstring(resp.text)
    if root.tag == "error":
        code = root.findtext(".//Code") or "Unknown"
        # E0016: 검색 결과 없음 → 빈 응답으로 처리
        if code == "E0016":
            return RecommendationResponse(
                totalcount=0,
                pyymm=None,
                recommendations=[]
            )
        # 그 외 오류는 그대로 예외로
        raise RuntimeError(f"DBpia 오류 코드: {code}")

    totalcount = int(root.findtext(".//totalcount") or 0)
    pyymm      = root.findtext(".//pyymm")

    items = []
    for node in root.findall(".//item"):
        # --- authors 파싱 ---
        authors = []
        ap = node.find("authors")
        if ap is not None:
            # author 태그
            for a in ap.findall("author"):
                name = a.get("name") or a.findtext("name")
                if name:
                    authors.append({
                        "order": a.get("order"),
                        "url":   a.get("url"),
                        "name":  name
                    })
            # 태그가 없으면 텍스트 폴백
            if not authors and ap.text:
                for nm in ap.text.split(","):
                    nm = nm.strip()
                    if nm:
                        authors.append({"order": None, "url": None, "name": nm})

        # --- publisher 파싱 ---
        pubr = node.find("publisher")
        publisher = {
            "url":  (pubr.get("url") if pubr is not None else None)
                  or (pubr.findtext("url") if pubr is not None else None),
            "name": (pubr.get("name") if pubr is not None else None)
                  or (pubr.findtext("name") if pubr is not None else None)
        }

        # --- publication 파싱 ---
        publ = node.find("publication")
        publication = {
            "url":  (publ.get("url") if publ is not None else None)
                   or (publ.findtext("url") if publ is not None else None),
            "name": (publ.get("name") if publ is not None else None)
                   or (publ.findtext("name") if publ is not None else None)
        }

        # --- 기타 필드 ---
        items.append({
            "title":        node.findtext("title"),
            "authors":      authors,
            "publisher":    publisher,
            "publication":  publication,
            "issue_yymm":   node.findtext("issue_yymm"),
            "pages":        node.findtext("pages"),
            "free_yn":      node.findtext("free_yn"),
            "price":        node.findtext("price"),
            "preview_yn":   node.findtext("preview_yn"),
            "preview":      node.findtext("preview"),
            "link_url":     node.findtext("link_url"),
            "link_api":     node.findtext("link_api")
        })

    # Pydantic 모델로 반환
    recs = [Recommendation(**item) for item in items]
    return RecommendationResponse(
        totalcount=totalcount,
        pyymm=pyymm,
        recommendations=recs
    )
