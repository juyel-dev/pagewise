# Ops · 02 · Waitlist with Google Apps Script

Zero-cost waitlist storage until Supabase arrives (step 2). Signups land in a Google Sheet you own.

## Setup (5 minutes)

1. Create a Google Sheet named `PageWise waitlist`. In row 1 add headers: `timestamp`, `email`, `goal`, `source`.
2. In the sheet: **Extensions → Apps Script**. Replace the code with the script below.
3. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorise when asked, then copy the **Web app URL** (ends with `/exec`).
5. Put that URL in `NEXT_PUBLIC_WAITLIST_URL` (Vercel env var, and `.env.local` for local testing). Redeploy.

## Script

```js
const SHEET_NAME = 'Sheet1'; // change if you renamed the tab

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = String(data.email || '').trim().toLowerCase();
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) {
      return json({ ok: false, error: 'invalid_email' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
      // De-duplicate by email (column B)
      const emails = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
      if (!emails.includes(email)) {
        sheet.appendRow([
          new Date(),
          email,
          String(data.goal || '').slice(0, 60),
          String(data.source || '').slice(0, 30),
        ]);
      }
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'server_error' });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

## Notes

- The site posts with `mode: "no-cors"` and `text/plain`, so the browser never sees the response. A completed request is treated as success.
- The honeypot field in the form blocks most bots; the script also validates the email and de-duplicates.
- **Privacy:** this sheet holds personal data. Keep it private, share it with no one, and delete rows on request. When Supabase auth ships, migrate signups and retire the sheet.
- Redeploy the Apps Script (**Deploy → Manage deployments → edit → new version**) after any script change; the URL stays the same.
