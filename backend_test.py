"""
Backend integration tests for JuristaAI legal assistant.
Tests the document upload, indexing, and chat pipeline.
"""
import requests
import time
import json
import os

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API = f"{BASE_URL}/api"


def test_health_check():
    """Test 1: Health check endpoint"""
    print("\n--- Test 1: Health Check ---")
    try:
        response = requests.get(f"{API}/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["status"] == "healthy", f"Expected 'healthy', got {data['status']}"
        print(f"  Status: {data['status']}")
        print(f"  Service: {data.get('service', 'N/A')}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_document_upload():
    """Test 2: Document upload and indexing"""
    print("\n--- Test 2: Document Upload ---")
    try:
        form_data = {
            "title": "Direito Civil Brasileiro - Volume 4",
            "author": "Carlos Roberto Gonçalves",
            "year": "2023",
            "legal_subject": "Direito Civil",
        }
        response = requests.post(f"{API}/documents/upload", data=form_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] is True, "Upload did not succeed"
        doc = data["data"]
        print(f"  Document ID: {doc['id']}")
        print(f"  Title: {doc['title']}")
        print(f"  Status: {doc['status']}")
        print(f"  Chunks: {doc.get('total_chunks', 0)}")
        return doc["id"]
    except Exception as e:
        print(f"  FAILED: {e}")
        return None


def test_document_list():
    """Test 3: List all documents"""
    print("\n--- Test 3: Document List ---")
    try:
        response = requests.get(f"{API}/documents")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] is True
        docs = data["data"]
        print(f"  Total documents: {len(docs)}")
        for doc in docs:
            print(f"    - {doc['title']} [{doc['status']}] ({doc.get('total_chunks', 0)} chunks)")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_document_stats():
    """Test 4: Document statistics"""
    print("\n--- Test 4: Document Stats ---")
    try:
        response = requests.get(f"{API}/documents/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        stats = data["data"]
        print(f"  Total documents: {stats['total_documents']}")
        print(f"  Total chunks: {stats['total_chunks']}")
        print(f"  Indexed: {stats['indexed_documents']}")
        print(f"  Pending: {stats['pending_documents']}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_chat_question():
    """Test 5: Chat - legal question"""
    print("\n--- Test 5: Chat Legal Question ---")
    try:
        payload = {
            "question": "O que é responsabilidade civil objetiva?",
            "max_sources": 5,
        }
        response = requests.post(f"{API}/chat", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] is True
        result = data["data"]
        print(f"  Answer length: {len(result['answer'])} chars")
        print(f"  Sources: {len(result['sources'])}")
        print(f"  Processing time: {result['processing_time']}s")
        for src in result["sources"]:
            print(f"    - {src['title']} ({src['author']}) p.{src.get('page', '?')} [{src['relevance_score']}]")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_chat_unknown_question():
    """Test 6: Chat - question with limited context"""
    print("\n--- Test 6: Chat Unknown Question ---")
    try:
        payload = {
            "question": "Qual é a teoria do risco administrativo?",
            "max_sources": 3,
        }
        response = requests.post(f"{API}/chat", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        result = data["data"]
        print(f"  Answer length: {len(result['answer'])} chars")
        print(f"  Sources: {len(result['sources'])}")
        has_fallback = "não foi possível" in result["answer"].lower() or "sugestões" in result["answer"].lower()
        print(f"  Fallback response: {'Yes' if has_fallback else 'No'}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_chat_stats():
    """Test 7: Chat stats endpoint"""
    print("\n--- Test 7: Chat Stats ---")
    try:
        response = requests.get(f"{API}/chat/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        stats = data["data"]
        print(f"  Total documents: {stats['total_documents']}")
        print(f"  Total chunks: {stats['total_chunks']}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def test_legal_subjects():
    """Test 8: Legal subjects list"""
    print("\n--- Test 8: Legal Subjects ---")
    try:
        response = requests.get(f"{API}/documents/subjects")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        subjects = data["data"]
        print(f"  Total subjects: {len(subjects)}")
        for s in subjects[:5]:
            print(f"    - {s}")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False


def main():
    print("=" * 60)
    print("  JuristaAI Backend Integration Tests")
    print("=" * 60)
    print(f"  API: {API}")
    print(f"  Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    results = {}

    # Run tests
    results["Health Check"] = test_health_check()
    doc_id = test_document_upload()
    results["Document Upload"] = doc_id is not None
    results["Document List"] = test_document_list()
    results["Document Stats"] = test_document_stats()
    results["Chat Question"] = test_chat_question()
    results["Chat Unknown"] = test_chat_unknown_question()
    results["Chat Stats"] = test_chat_stats()
    results["Legal Subjects"] = test_legal_subjects()

    # Clean up
    if doc_id:
        try:
            requests.delete(f"{API}/documents/{doc_id}")
        except Exception:
            pass

    # Summary
    print("\n" + "=" * 60)
    print("  TEST SUMMARY")
    print("=" * 60)
    passed = 0
    failed = 0
    for name, result in results.items():
        status = "PASS" if result else "FAIL"
        icon = "+" if result else "-"
        print(f"  [{icon}] {name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1

    print(f"\n  Total: {passed + failed} | Passed: {passed} | Failed: {failed}")
    print("=" * 60)


if __name__ == "__main__":
    main()
