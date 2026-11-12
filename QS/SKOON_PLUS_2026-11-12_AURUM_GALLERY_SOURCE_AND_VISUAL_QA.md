# SKOON Plus — Aurum Hotel gallery attribution correction
Date: 2026-11-12 Asia/Dubai
Status: QA PASS, production merge check pending.

## SOURCE
- Original governance: `QS/governance/SKOON_AI_GOVERNANCE_MASTER_v1.0.md` SGP-01 v1.0 proposed, 2026-10-27, read.
- User instruction: image of Jaiedco in site's design showcase is not SKOON design; replace with Aurum Hotel. Treat owner-supplied attribution as factual instruction and avoid independently reassigning others' designs.
- Current production repo `kaqeelskoon/SKOON_Portal_v2_Bilingual_Design`, main source SHA `577803de82f8452dbd63c263048881ccffe3d8d8`.
- `app.js` original gallery at line 34 links `assets/tower.jpg` and login at line 35 uses `assets/${employee?'tower':'hero'}.jpg`; both were targeted.
- Original SKOON Drive project asset source: `SD-P256-AURUM STATE HOTEL`, image `P256_A1_Enabling Package Cover.jpg`, Drive file ID `199FebQorqd-s-Dnd8sH7wCFFTw4UPbyx`; JPEG original 749674 bytes, visually inspected: SKOON logo and Aurum Estates artwork.
- Additional alternative `aurom contract cover.jpg`, Drive file ID `1Iyz_BxYr6UydPcaYpsCa4z7O0q0XWxbz`, visually inspected but not used because it contains a full contract page rather than a suitable gallery photo.

## CHANGES
Branch `fix/aurum-gallery-image-20261112`, PR #4 https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/pull/4 .
- Binary original stored as `assets/aurum-p256-cover.jpg`, GitHub blob SHA `e72735bd69cc6ea1e4a4ae30399c554d5821eede`, exact Drive bytes no AI transformation.
- `app.js`: change second image in gallery to `assets/aurum-p256-cover.jpg`, bilingual alt/caption Aurum Hotel · SD-P256 / فندق أوروم · SD-P256; employee demo-login now uses same source instead of tower. Other images unchanged.
- Retain original `assets/tower.jpg` in repository to preserve historical binary; no longer rendered in these two locations.
- `tests/aurum-gallery-visual.test.cjs` + `.github/workflows/skoon-aurum-gallery-qa.yml`: tests desktop/mobile EN/AR, image loads, localized label, and employee screen; screenshot artifact under QS.

## EXECUTION AND VISUAL QA
- Initial CI run 43190217650 on SHA 2418eb...: failed mobile test at test line 40 because screenshot assertions checked a lazy-loading image before scrolling to it. Classification: `اشتباه غير قابل للتأكيد` for an alleged site failure; observed test-order issue.
- Fixed test wait: scroll image into view + decode() before naturalWidth assertion; CI run 43190451034 on SHA 9553ef...: PASS 3/3, 8 screenshots, but fixed office-tour overlay in full page screenshot obstructed image evidence.
- Improved visual QA via supported URL `?office=skip` to bypass on-site virtual office overlay during *test only*; added gallery-only screenshots. No change to office tour or live page behavior.
- Final exact tested SHA `58de41213ed912fe9c4b8b6b238008225706c84a`, GitHub Actions https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43191011309 : 3 PASS, 0 FAIL; 12 PNG screenshots artifact https://github.com/kaqeelskoon/SKOON_Portal_v2_Bilingual_Design/actions/runs/43191011309/artifacts/13930637144 , SHA256 `c3777a0fea758defc4d3a0b39c85de514b7795ea0da04972551d3c87393f88ad`, locally verified.
- Inspected `desktop-en-gallery-only.png`, `mobile-ar-gallery-only.png`, `mobile-ar-employee.png` visually. All display correct Aurum image and appropriate label with no visible cropping defect for tested states. Other screenshots emitted but not every one individually viewed.
- All test assets and screenshots kept in QS artifact, not external tender folder.
- Browser tests on branch isolated; no data changes.

## RELEASE BOUNDARY
Only PR4 gallery correction is requested for actual site. Stage9 PR3 remains Draft and unmerged. Production verification after merge is a separate gate; do not assert complete until Vercel Ready and live image manually confirmed.

## SOURCE / RULES / REFERENCES / QA / CHANGES / HOLD / CHECKPOINT
SOURCE verified Drive source JPEG and site code. RULES SGP-01 source attribution + visual QA. REFERENCES links/SHAs above. QA PASS for 3 Chromium records and reviewed image captures. CHANGES scoped to asset/gallery/login + tests. HOLD production merge/deployment verification at writing. CHECKPOINT retained here.
