# Blueprint · 12 · PageWise Study Section Plan & Specification v1.0

**Authoritative document — authored by the owner, 2026-10-30.**
**Status:** APPROVED — 2026-10-30 (owner approved spec + blueprint/13's four proposals). Implementation may start per §12.
**Scope:** Class 11 ও Class 12 — PCB (Physics, Chemistry, Biology)
**Rule:** Implementation শুরু করার আগে এই specification অনুমোদন করতে হবে।

## 1. Objective

PageWise-এর Study section-এ শিক্ষার্থীরা NCERT chapter পড়বে, PDF-এর page ধরে এগোবে এবং প্রতিটি page-এর সঙ্গে যুক্ত expected questions অনুশীলন করবে।

Study হবে Home থেকে আলাদা একটি feature। বর্তমান storyboard-এর Study dashboard-কে Study section-এর design reference হিসেবে ব্যবহার করা হবে, Home page হিসেবে নয়।

## 2. Subject Selection

Study-তে তিনটি subject থাকবে:

- Biology
- Physics
- Chemistry

প্রতিটি subject-এর নিজস্ব chapter list, PDF, page mapping এবং questions থাকবে। একই viewer ও reusable UI components তিনটি subject-এই ব্যবহার করা হবে।

## 3. User Flow

**Home → Study → Subject → Class → Chapter → Study Dashboard → Read PDF / Practice Questions**

উদাহরণ:

`Study → Biology → Class 11 → Anatomy of Flowering Plants`

একইভাবে Physics ও Chemistry-র chapter নির্বাচন করা যাবে।

## 4. Study Dashboard

নির্বাচিত subject ও class অনুযায়ী dashboard-এর তথ্য দেখাবে।

প্রস্তাবিত UI elements:

- Subject ও class পরিচয়
- Chapter list
- Continue Studying
- Recent Chapters
- Chapter completion/progress
- PDF পড়ার shortcut
- Questions practice করার shortcut

Biology-র জন্য তৈরি dashboard যেন Physics বা Chemistry নির্বাচন করলে Biology-specific তথ্য না দেখায়।

## 5. NCERT PDF Viewer

নিজস্ব PDF viewer ব্যবহার করা হবে; embedded iframe-কে মূল viewer হিসেবে ব্যবহার করা হবে না।

Viewer-এর requirements:

- অনুমোদিত/বৈধ উৎসের chapter PDF লোড করা
- Previous/Next page navigation
- Page number ও total pages দেখানো
- PDF loading এবং error states
- Day/Night mode
- Current chapter ও current page track করা
- PDF-এর প্রকৃত page index এবং NCERT-এ মুদ্রিত page number-এর mapping রাখা
- Desktop ও mobile responsive layout

PDF page index ও printed NCERT page number আলাদা হতে পারে। তাই তাদের একই ধরে নেওয়া যাবে না।

## 6. Page-Based Questions

প্রতিটি chapter-এর জন্য reviewed expected questions সংরক্ষিত থাকবে।

Requirements:

- প্রশ্ন নির্দিষ্ট subject, class, chapter ও page-এর সঙ্গে যুক্ত থাকবে।
- Practice Questions চাপলে বর্তমান page-এর সঙ্গে যুক্ত প্রশ্ন দেখানো হবে।
- MCQ-এর options ও correct answer থাকবে।
- প্রয়োজন অনুযায়ী explanation যোগ করা যাবে।
- Question data PDF viewer থেকে আলাদা থাকবে।
- PDF-এর page পরিবর্তন হলে question panel-ও সেই অনুযায়ী আপডেট হবে।
- কোনো page-এর প্রশ্ন না থাকলে পরিষ্কার empty state দেখাবে।

প্রশ্নগুলো আগে থেকে প্রস্তুত ও review করা থাকবে; প্রতিবার page খুললেই নতুন করে AI-কে প্রশ্ন তৈরি করতে হবে না।

## 7. Progress Tracking

প্রতিটি ব্যবহারকারীর জন্য সংরক্ষণ করার প্রস্তাব:

- নির্বাচিত subject ও class
- শেষ পড়া chapter
- শেষ পড়া page
- Chapter progress
- Attempted questions
- সঠিক ও ভুল উত্তরের হিসাব
- সর্বশেষ পড়ার সময়

Progress অবশ্যই user-specific হবে। Login না করা ব্যবহারকারীর progress কীভাবে সংরক্ষণ হবে, তা implementation-এর আগে নির্ধারণ করতে হবে।

## 8. Data Architecture

প্রধান data entities:

- **Subjects:** Biology, Physics, Chemistry
- **Classes:** Class 11, Class 12
- **Chapters:** subject ও class অনুযায়ী chapter metadata
- **PDFs:** chapter PDF storage path ও file metadata
- **Page Mappings:** PDF page index থেকে printed NCERT page number
- **Questions:** প্রশ্ন, options, answer, explanation ও page association
- **Study Progress:** user, chapter, page ও completion data
- **Question Attempts:** user-এর answer ও result

একটি chapter-এর PDF বা question data পরিবর্তন করলে অন্য subject-এর data প্রভাবিত হওয়া উচিত নয়।

## 9. PDF Storage & Access

বর্তমান Supabase setup পরীক্ষা করে ব্যবহারযোগ্য storage ও access pattern নিশ্চিত করতে হবে।

- Chapter PDF-গুলো কেন্দ্রীয়ভাবে সংরক্ষিত থাকবে।
- PDF path ও metadata chapter record-এর সঙ্গে যুক্ত থাকবে।
- Access control server-side যাচাই করা হবে।
- শুধু অনুমোদিত PDF-ই প্রকাশ করা হবে।
- একই PDF অপ্রয়োজনীয়ভাবে বারবার upload করা হবে না।

## 10. Day/Night Mode

Day/Night mode-এর আচরণ আলাদা করে যাচাই করতে হবে।

- PDF page-এর রং পরিবর্তনের আচরণ স্পষ্টভাবে নির্ধারণ করতে হবে।
- Text ও diagram-এর readability নষ্ট হওয়া চলবে না।
- PDF-এর মূল রং পরিবর্তন না করে শুধু surrounding UI-এর theme পরিবর্তনের বিকল্প বিবেচনা করতে হবে।
- Biology, Physics ও Chemistry-র বিভিন্ন ধরনের diagram ও equation দিয়ে পরীক্ষা করতে হবে।

## 11. Responsive Design

**Desktop:** PDF ও question panel পাশাপাশি দেখানোর সুযোগ থাকবে।

**Mobile:** PDF ও question panel এমনভাবে দেখাতে হবে যাতে পড়া, page navigation এবং questions practice সহজ হয়। প্রয়োজনে panel switching বা stacked layout ব্যবহার করা যাবে।

## 12. Implementation Order

1. বর্তমান GitHub repository ও Supabase setup audit করা
2. Subject/Class/Chapter selection তৈরি করা
3. Chapter data ও PDF access নিশ্চিত করা
4. PDF viewer ও page navigation সম্পূর্ণ করা
5. PDF-to-printed-page mapping যোগ করা
6. Page-based question panel তৈরি করা
7. Progress tracking যোগ করা
8. Day/Night mode যাচাই করা
9. Desktop ও mobile testing
10. তিনটি subject-এর জন্য end-to-end testing

প্রতিটি ধাপে আগে থেকেই থাকা functionality পুনরায় তৈরি না করে বর্তমান implementation পুনর্ব্যবহার করতে হবে।

## 13. Acceptance Criteria

Study section সম্পূর্ণ বলে গণ্য হবে যখন:

- তিনটি subject নির্বাচন করা যায়।
- Class 11 ও Class 12 আলাদাভাবে নির্বাচন করা যায়।
- সঠিক subject ও class-এর chapter দেখা যায়।
- Chapter PDF নির্ভরযোগ্যভাবে খোলে।
- PDF page navigation সঠিকভাবে কাজ করে।
- Printed page number mapping সঠিক থাকে।
- বর্তমান page-এর expected questions দেখা যায়।
- MCQ answer ও explanation সঠিকভাবে কাজ করে।
- User-এর progress সংরক্ষিত থাকে।
- Day/Night mode-এ PDF-এর readability বজায় থাকে।
- Desktop ও mobile-এ ব্যবহারযোগ্য থাকে।
- Home page-এর existing architecture অপ্রয়োজনীয়ভাবে পরিবর্তন করতে হয় না।

## 14. Out of Scope for This Phase

- Home page-এর পূর্ণ implementation
- Leaderboard ও social features
- Sponsored content ও affiliate sections
- নতুন AI question-generation system
- অপ্রয়োজনীয় redesign বা repository restructuring

## 15. Change Control

এই specification অনুমোদনের পর কোনো বড় architecture change করার আগে তার কারণ, প্রভাব, বিকল্প ও প্রস্তাবিত সিদ্ধান্ত ব্যাখ্যা করতে হবে।

**বর্তমান অবস্থা (2026-10-30):** Specification তৈরি হয়েছে। কোনো code, repository বা database পরিবর্তন করা হয়নি।
