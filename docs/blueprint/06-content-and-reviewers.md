# Blueprint · 06 · Content pipeline and reviewers

Extends `docs/product/03-content-and-legal-guardrails.md` §2. Accuracy is the product.

## 1. Pipeline stages

| Stage | Who/what | Output | Gate |
|---|---|---|---|
| 1. Page intake | Script reads the official chapter PDF **locally** (never committed) | Per-page working text in a private, git-ignored folder | Page map verified against official page numbers |
| 2. Generate | LLM, strict JSON schema, per page | `draft` questions with `source_note` | Schema valid |
| 3. Auto-check | Second pass with a different prompt/model: answer derivable from the page? one defensible option? length/format rules? similarity to existing questions? | `auto_checked` or `auto_check_failed` | Failures go to priority review |
| 4. Human review | Reviewer console | `approved` / edited / rejected | Checklist complete |
| 5. Publish | Release script | Static JSON release | Schema + counts + diff reviewed by admin |
| 6. Monitor | Reports, accuracy anomalies | `flagged` → re-review | Auto-hide at threshold |

## 2. Question quality bar

1. Answerable from the cited page (or its figure/table); no outside knowledge required.
2. Exactly one defensible answer; distractors plausible, not trick wording.
3. NEET style: mix of direct recall, application, statement-based, assertion-reason, match.
4. No verbatim long NCERT passages; short phrases only; own wording.
5. Explanation 1–3 sentences, states *why*, points to the page.
6. Difficulty tagged (easy/medium/hard) by reviewer, not only by the model.
7. No "all of the above/none of the above" unless the page directly supports it.
8. Avoid facts that vary between NCERT editions; record `edition` in source note.

**Coverage target per page:** set by content density, not a quota. Default range 4–12; a page with only a figure caption may have 0. Chapter coverage report must show every page as `covered`, `no-content-page` (with reason) or `gap`.

## 3. Prompt and model governance

Prompts and schemas are versioned in the repo; each generated draft stores `prompt_version` and `model_id`. Changing a prompt triggers a sampled regression review (≥ 50 questions) before bulk runs. Cost log per run. No student data ever enters prompts.

## 4. Reviewer program

| Item | Design |
|---|---|
| Who | Medical students/high scorers, invited, verified (ID or referral), signed contributor terms |
| Onboarding | Style guide, 20 gold-standard examples, a 30-question calibration test; pass ≥ 90% to join |
| Quality control | 10% of approvals double-reviewed; disagreement tracked; reviewer with falling agreement gets coaching, then reduced scope |
| Workload | Claim lock 15 min; target ≤ 90 s per clean item; daily soft cap to avoid fatigue errors |
| Credits | Points per reviewed item (weighted by difficulty and agreement), badges, public contributor page (opt-in) |
| Stipend | Optional, funded once revenue exists (phase E); never per-item incentives that reward speed over accuracy |
| Conflicts | Reviewers cannot review their own edits |

## 5. Reviewer console requirements

Queue filters and counts · claim/release · NCERT page beside the question (same embed/fallback) · live student-view preview · inline edit with diff · mandatory checklist · reject reason codes · keyboard shortcuts · version history · bulk "needs re-check" after prompt change · stats panel · audit trail. All actions logged (REV-8).

## 6. Quality metrics and thresholds

| Metric | Healthy | Action if worse |
|---|---|---|
| Report rate per 1,000 answers | < 5 and falling | Re-review top reported chapters |
| Reviewer agreement | ≥ 95% | Coach, recalibrate guidelines |
| Auto-check failure rate | < 15% | Improve prompts |
| Post-publish retire rate | < 2% | Tighten review sampling |
| Median report → fix time | < 48 h | Add reviewer capacity |

## 7. Content licensing and trust

Only our own original text is stored or published. A visible footer states independence from NCERT/NTA. A contributor and methodology page (phase C) explains the review process truthfully; wording goes live only when each claim is true. Optional: write to NCERT for acknowledgement before public launch.

## 8. Language expansion procedure

Add language = translate payloads with a model + native-speaker review (same console, language filter) + font/RTL check + catalogue strings + QA pass in the workspace. A language ships only when every published English question has a reviewed counterpart for the chapters offered in that language.
