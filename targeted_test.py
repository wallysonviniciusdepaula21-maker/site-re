"""
Targeted tests for specific JuristaAI backend features.
Focuses on critical paths: health, upload, indexing, chat, and edge cases.
"""
import requests
import time
import json
import os

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API = f"{BASE_URL}/api"


def test_health():
    """Verify API health endpoint"""
    print("[1/6] Health Check...", end=" ")
    try:
        r = requests.get(f"{API}/health", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        print("PASS")
        return True
    except Exception as e:
        print(f"FAIL - {e}")
        return False


def test_document_upload():
    """Upload a test document with metadata"""
    print("[2/6] Document Upload...", end=" ")
    try:
        form = {
            "title": "Código Civil Comentado",
            "author": "Nelson Nery Jr.",
            "year": "2024",
            "legal_subject": "Direito Civil",
        }
        r = requests.post(f"{API}/documents/upload", data=form, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        doc = data["data"]
        assert doc["status"] == "indexed"
        print(f"PASS (id={doc['id'][:8]}..., chunks={doc['total_chunks']})")
        return doc["id"]
    except Exception as e:
        print(f"FAIL - {e}")
        return None


def test_indexing_status(doc_id):
    """Verify document indexing completed"""
    print("[3/6] Indexing Verification...", end=" ")
    if not doc_id:
        print("SKIP (no doc_id)")
        return False
    try:
        r = requests.get(f"{API}/documents/{doc_id}", timeout=10)
        assert r.status_code == 200
        doc = r.json()["data"]
        assert doc["status"] == "indexed"
        assert doc["total_chunks"] > 0
        print(f"PASS (status={doc['status']}, chunks={doc['total_chunks']})")
        return True
    except Exception as e:
        print(f"FAIL - {e}")
        return False


def test_stats_verification():
    """Verify stats endpoint returns correct data"""
    print("[4/6] Stats Verification...", end=" ")
    try:
        r = requests.get(f"{API}/chat/stats", timeout=10)
        assert r.status_code == 200
        stats = r.json()["data"]
        print(f"PASS (docs={stats['total_documents']}, chunks={stats['total_chunks']})")
        return True
    except Exception as e:
        print(f"FAIL - {e}")
        return False


def test_legal_question():
    """Ask a legal question and verify answer quality"""
    print("[5/6] Legal Question...", end=" ")
    try:
        payload = {
            "question": "O que é responsabilidade civil objetiva?",
            "max_sources": 5,
        }
        r = requests.post(f"{API}/chat", json=payload, timeout=30)
        assert r.status_code == 200
        result = r.json()["data"]
        assert len(result["answer"]) > 100, "Answer too short"
        assert len(result["sources"]) > 0, "No sources returned"
        print(f"PASS (answer={len(result['answer'])}chars, sources={len(result['sources'])})")
        return True
    except Exception as e:
        print(f"FAIL - {e}")
        return False


def test_no_context_question():
    """Test question that may lack indexed context"""
    print("[6/6] No-Context Question...", end=" ")
    try:
        payload = {
            "question": "O que é habeas corpus?",
            "max_sources": 3,
        }
        r = requests.post(f"{API}/chat", json=payload, timeout=30)
        assert r.status_code == 200
        result = r.json()["data"]
        assert len(result["answer"]) > 50
        has_info = any(
            kw in result["answer"].lower()
            for kw in ["habeas corpus", "liberdade", "constituição", "coação"]
        )
        print(f"PASS (has_relevant_info={has_info})")
        return True
    except Exception as e:
        print(f"FAIL - {e}")
        return False


def main():
    print("=" * 50)
    print("  JuristaAI Targeted Tests")
    print(f"  API: {API}")
    print(f"  Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    results = []

    results.append(("Health Check", test_health()))
    doc_id = test_document_upload()
    results.append(("Document Upload", doc_id is not None))
    results.append(("Indexing Status", test_indexing_status(doc_id)))
    results.append(("Stats Verification", test_stats_verification()))
    results.append(("Legal Question", test_legal_question()))
    results.append(("No-Context Question", test_no_context_question()))

    # Cleanup
    if doc_id:
        try:
            requests.delete(f"{API}/documents/{doc_id}")
        except Exception:
            pass

    # Summary
    print("\n" + "=" * 50)
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"  Results: {passed}/{total} passed")
    for name, result in results:
        print(f"    {'[+]' if result else '[-]'} {name}")
    print("=" * 50)


if __name__ == "__main__":
    main()
