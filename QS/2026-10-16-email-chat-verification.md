# Email and chat verification — 2026-10-16

Implementation commits: 4b5d21055ce3ad0d95bbfa3244d3dd3eb815a48b, 860763e85f443758d8e20346094f7fbf7135a66c.
English default commits: 5fb765339f7b528e8b5dd219385de1e184e16d91, f87a2713e827e6e938b500d9bfae3b6b81e5efb1.

Live browser tests at https://skoonaiv2.vercel.app/:
- Reception enquiry delivered to configured SKOON inbox and visitor acknowledgement arrived in Inbox. Reference 9c92a6c8-7799-4812-a3e2-cfa7e91d0bbb.
- Consultation request delivered and acknowledgement arrived in Inbox. Reference d4055090-d64f-4f73-99ef-779d8c8eb420.
- Chat required name/mobile/consent before input. Two AI exchanges succeeded. Second received email was read and contained visitor details plus BOTH user questions and BOTH assistant answers. Conversation a3bd02c4-cb19-4de2-b5cf-7e9b2f8a9b6a. Gmail message 1a145ac77a9439d1. SPF/DKIM passed.
- Test names clearly marked TEST; mobile 0000000000 is a dummy. No real customer data used.
- Root opening English verified after previously selecting Arabic. Arabic chat screenshot inspected.

Backend mock tests passed: fixed recipient routing, automatic acknowledgement, phone/consent validation, cross-origin rejection, partial/total email failure, idempotency keys, cumulative chat transcript. Syntax checks passed for changed JS files.

Configuration: verified sending subdomain updates.skoon-automation.com; Resend API credential stored only in Vercel production Secret environment. No credential in source. Cloudflare changes limited to three sending DNS records.

Behavior and limits: chat sends a cumulative transcript after each successful reply; visitor identity uses sessionStorage, with transcript retained in delivered email (no CRM database added). Explicit privacy notice and consent are required. Rate limiting is best effort per function instance, not distributed. Chat transcript limit is 100 messages. Failed AI requests do not trigger transcript email. Existing prototype banner remains appropriate for the wider portal.
