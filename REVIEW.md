# JuristaAI Code Review

## 1. Code Quality Issues

### A. `indexar_acervo.py` — Global State & Script Structure
- **Lines 612-617**: Module-level mutable state (`total_chunks_criados`, `documentos_pendentes`, etc.) makes the script untestable and non-importable. The entire processing loop runs at import time.
- **Lines 269-334**: `buscar_isbn_online()` imports `requests` inside the function body twice instead of at module level.
- **Lines 636-644**: `salvar_lote()` references `_index_memoria` as a global but it's defined conditionally (lines 649-672). If Qdrant import fails AND the LlamaIndex index directory doesn't exist, the fallback creates a fresh index that's never persisted within `salvar_lote`.

### B. `baixar_tudo.py` — Undefined Variable Bug
- **Line 209**: `prev_count` is used before assignment — `if page > 1 and len(all_sumulas) == prev_count` will crash on page=1 because `prev_count` is only initialized at line 217, after the loop. This is a runtime bug.

### C. `migrar_para_server.py` — Incomplete Migration
- The script is essentially a diagnostic tool, not a working migrator. Lines 142-188: The `points_table` and `separate_tables` branches read data but never actually build `PointStruct` objects or upsert to the server. The entire migration path is unfinished.

### D. `legal_source_classifier.py` — Good Quality
- Well-structured with clear separation of concerns. The `classificar_fonte()` function cleanly composes the individual detection functions. No major issues.

### E. Backend Server (`server.py`)
- Uses `asynccontextmanager` lifespan properly — good pattern.
- `set_db()` dependency injection pattern for route modules is clean but creates tight coupling. A proper DI container would be more maintainable at scale.

---

## 2. Performance Bottlenecks

### A. Vector Service — Multi-Collection Serial Search
- The vector service queries 4 separate Qdrant collections sequentially (`jurista_legal_docs`, `jurista_leis`, `jurista_sumulas`, `jurista_jurisprudencia`). These should be **parallelized with `asyncio.gather()`** — this alone could cut retrieval time by ~75%.

### B. Chat Pipeline — Dual LLM Calls
- The pipeline makes 2 LLM calls per question (Legal Issue Extraction + Legal Reasoning). The extraction step (Stage 0) could be replaced with keyword/regex-based extraction (which the `legal_source_classifier.py` already demonstrates) to eliminate one LLM call, reducing latency by **3-5 seconds** and halving LLM costs.

### C. Indexing Script — No Parallelism
- `indexar_acervo.py` processes books sequentially. For a 36GB corpus (~7000 books), using `concurrent.futures.ProcessPoolExecutor` for text extraction + chunking would significantly reduce the ~15-20 hour runtime.

### D. No Semantic Cache Eviction
- The chat service implements semantic caching but there's no eviction policy. For long-running servers, this will grow unbounded in memory. Add TTL or LRU eviction.

### E. Excessive Text Loading for Metadata
- `indexar_acervo.py` line 157 joins the first 20 pages into memory for metadata detection. Only the first 2-3KB is needed for ISBN/author extraction.

---

## 3. Security Concerns

### A. File Upload — No Size Limits
- `document_routes.py` accepts PDF/EPUB uploads without enforcing file size limits. A 10GB file upload could exhaust disk space and memory.
- **Fix**: Add `UploadFile` size validation (e.g., max 200MB).

### B. File Upload — Path Traversal Risk
- Document uploads save to `data/uploads/` using filenames from user input. If filenames contain `../` sequences, this could write files outside the intended directory.
- **Fix**: Sanitize filenames with `pathlib.PurePosixPath(filename).name`.

### C. CORS Wildcard Default
- `CORS_ORIGINS` defaults to `'*'`. For a production legal AI system handling potentially sensitive legal queries, this should be restricted to known origins.

### D. No Authentication
- No auth layer protects any endpoints. Anyone with the URL can upload documents, make queries, and delete documents.
- **Fix**: Add API key authentication at minimum, or JWT for user sessions.

### E. No Rate Limiting
- No rate limiting on any endpoints. The `/chat` endpoint makes expensive LLM calls. A single client could exhaust the OpenAI API budget.
- **Fix**: Add `slowapi` or similar rate limiting middleware.

### F. Web Scraping Without Safeguards
- `baixar_tudo.py` scrapes government sites with only 2-second delays. Could trigger IP bans.
- **Fix**: Add exponential backoff and respect `robots.txt`.

---

## 4. Architecture Improvements

### A. Consolidate Vector Store Backend
- The vector service maintains 3 fallback paths (Remote Qdrant → Local Qdrant → LlamaIndex). Commit to one backend (Qdrant Server) and remove the LlamaIndex fallback entirely.

### B. Implement `delete_document_chunks()`
- The vector service has a TODO for Qdrant deletion. Deleted documents still have chunks in the vector store, leading to ghost results in search. **Critical to fix.**

### C. Refactor Indexing Script
- `indexar_acervo.py` has hardcoded Windows paths (`C:\Users\joaop\OneDrive\...`). The README mentions CLI flags (`--pasta`, `--chunk-size`) but the actual code uses hardcoded constants. Refactor into a proper CLI tool with `argparse` or `typer`.

### D. Add Server-Side Request Timeout
- The 120-second frontend timeout should have a server-side counterpart. If the LLM hangs, cancel the request rather than consuming resources.

### E. Use Native MongoDB Datetime
- MongoDB documents use string timestamps (ISO format) instead of native `datetime` objects. This prevents efficient timestamp indexing. Use `datetime` objects directly.

### F. Add Structured Logging
- Use JSON-formatted structured logging for production to enable log aggregation and monitoring.

### G. Priority Order for Enabling Disabled Agents
1. **Legal Task Router** — improves query classification immediately
2. **Jurisprudence Retrieval** — leverages existing súmula/temas data
3. **Deadline Agent** — high practical value for legal practitioners
4. **Decision Analyzer** — useful for judicial decision analysis
5. **Legal Draft Generator** — document generation
6. **Procedural Strategy** — appellate strategy mapping

---

## Summary of Critical Items

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | `prev_count` undefined variable bug in `baixar_tudo.py` | Runtime crash |
| P0 | `delete_document_chunks()` unimplemented | Ghost search results |
| P0 | No file upload size limits | Server DoS risk |
| P0 | No authentication on any endpoint | Unauthorized access |
| P1 | Path traversal in file uploads | File system compromise |
| P1 | Serial vector search across 4 collections | 4x unnecessary latency |
| P1 | Dual LLM calls per query | 2x cost, 3-5s extra latency |
| P2 | No semantic cache eviction | Memory leak |
| P2 | Hardcoded Windows paths in indexer | Portability |
| P2 | Incomplete migration script | Non-functional tooling |
