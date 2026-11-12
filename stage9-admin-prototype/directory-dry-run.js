'use strict';
/*
 * Stage9 non-operational directory import preflight.
 * INPUT: synthetic or explicitly user-supplied JSON string + optional read-only target snapshot.
 * OUTPUT: observations only. NEVER writes, authorizes, uploads, migrates or returns a write instruction.
 * This module intentionally contains no network, storage, filesystem or database integration.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SkoonDirectoryDryRun = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MAX_BYTES = 1024 * 1024;
  const MAX_CATEGORIES = 200;
  const MAX_COMPANIES = 5000;
  const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);
  const isRecord = o => o !== null && typeof o === 'object' && !Array.isArray(o);
  const identifier = s => typeof s === 'string' && s.length > 0 && s.length <= 120 && !forbiddenKeys.has(s);
  const nonempty = s => typeof s === 'string' && s.trim().length > 0 && s.length <= 90;
  const normalize = s => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
  function checkUrl(url) {
    if (typeof url !== 'string') return 'URL_TYPE';
    if (!url) return null;
    if (url.length > 2048) return 'URL_LENGTH';
    try {
      const u = new URL(url);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'URL_PROTOCOL';
      if (!u.hostname || u.username || u.password) return 'URL_CREDENTIALS';
      return null;
    } catch { return 'URL_INVALID'; }
  }
  function examine(sourceJson, targetJson) {
    const findings = [];
    const add = (severity, code, path, detail) => {
      findings.push(Object.freeze({ severity, code, path, detail }));
    };
    const result = (sourceSchema, counts) => Object.freeze({
      status: findings.some(f => f.severity === 'block') ? 'BLOCKED' : 'REVIEW_REQUIRED',
      sourceSchema, counts: Object.freeze(counts), findings: Object.freeze(findings),
      canExecuteImport: false, writesPerformed: false, approvalVerified: false
    });
    if (typeof sourceJson !== 'string' || sourceJson.length > MAX_BYTES) {
      add('block', 'SOURCE_SIZE_OR_TYPE', '$', 'Source must be a bounded JSON string.');
      return result(null, {categories: 0, companies: 0});
    }
    let source;
    try { source = JSON.parse(sourceJson); }
    catch {
      add('block', 'SOURCE_JSON', '$', 'Source is not valid JSON.');
      return result(null, {categories: 0, companies: 0});
    }
    if (!isRecord(source)) {
      add('block', 'SOURCE_SHAPE', '$', 'Expected a JSON object.');
      return result(null, {categories: 0, companies: 0});
    }
    if (source.schemaVersion !== 1 && source.schemaVersion !== 2)
      add('block', 'UNSUPPORTED_SCHEMA', '$.schemaVersion', 'Only source schema v1 or v2 can be reviewed.');
    if (!Array.isArray(source.categories) || !Array.isArray(source.companies)) {
      add('block', 'SOURCE_COLLECTIONS', '$', 'categories and companies must be arrays.');
      return result(source.schemaVersion ?? null, {categories: 0, companies: 0});
    }
    if (source.categories.length > MAX_CATEGORIES || source.companies.length > MAX_COMPANIES) {
      add('block', 'SOURCE_LIMIT', '$', 'Collection size exceeds safe review bounds.');
      return result(source.schemaVersion, {categories: source.categories.length, companies: source.companies.length});
    }
    const categoryIds = new Set();
    source.categories.forEach((c, i) => {
      const at = '$.categories[' + i + ']';
      if (!isRecord(c) || !identifier(c.id) || !nonempty(c.en) || !nonempty(c.ar)) {
        add('block', 'CATEGORY_INVALID', at, 'A category requires a unique valid id and nonempty AR/EN titles.');
        return;
      }
      if (categoryIds.has(c.id)) add('block', 'CATEGORY_DUPLICATE_ID', at + '.id', 'Duplicate category identifier.');
      categoryIds.add(c.id);
    });
    const companyIds = new Set(), normalizedNames = new Set(), normalizedUrls = new Set();
    source.companies.forEach((c, i) => {
      const at = '$.companies[' + i + ']';
      if (!isRecord(c) || !identifier(c.id) || !nonempty(c.en) || !nonempty(c.ar)
        || !identifier(c.category) || !categoryIds.has(c.category)) {
        add('block', 'COMPANY_INVALID', at, 'Company requires a valid id, known category and nonempty AR/EN titles.');
        return;
      }
      if (companyIds.has(c.id)) add('block', 'COMPANY_DUPLICATE_ID', at + '.id', 'Duplicate company identifier.');
      companyIds.add(c.id);
      const urlError = checkUrl(c.url);
      if (urlError) add('block', urlError, at + '.url', 'URL must be a valid HTTP(S) address without credentials, or blank.');
      if (typeof c.url === 'string' && c.url.startsWith('http:'))
        add('review', 'HTTP_URL', at + '.url', 'Non-TLS link requires review.');
      const nameKey = c.category + ':' + normalize(c.en);
      if (normalizedNames.has(nameKey)) add('review', 'POSSIBLE_DUPLICATE_NAME', at + '.en', 'Similar company title in category.');
      normalizedNames.add(nameKey);
      if (c.url && !urlError) {
        const urlKey = normalize(c.url);
        if (normalizedUrls.has(urlKey)) add('review', 'POSSIBLE_DUPLICATE_URL', at + '.url', 'Repeated website URL.');
        normalizedUrls.add(urlKey);
      }
    });
    if (source.schemaVersion === 1)
      add('review', 'LEGACY_SCHEMA', '$.schemaVersion', 'Historical schema needs migration plan and owner consent.');

    if (targetJson !== undefined) {
      if (!isRecord(targetJson) || !Array.isArray(targetJson.categories) || !Array.isArray(targetJson.companies))
        add('block', 'TARGET_SHAPE', '$target', 'Target snapshot must have arrays; no implicit target is assumed.');
      else {
        const targetIds = new Set(targetJson.companies.filter(isRecord).map(c => c.id));
        const targetCats = new Set(targetJson.categories.filter(isRecord).map(c => c.id));
        source.companies.forEach((c, i) => {
          if (isRecord(c) && targetIds.has(c.id))
            add('review', 'EXISTING_COMPANY_ID', '$.companies[' + i + '].id', 'Identifier already exists in target snapshot; manual reconciliation required.');
        });
        source.categories.forEach((c, i) => {
          if (isRecord(c) && targetCats.has(c.id))
            add('review', 'EXISTING_CATEGORY_ID', '$.categories[' + i + '].id', 'Category exists; manual reconciliation required.');
        });
      }
    } else {
      add('review', 'TARGET_NOT_VERIFIED', '$target', 'No verified target snapshot provided; cannot assess conflicts.');
    }
    add('review', 'AUTHORIZATION_NOT_VERIFIED', '$authorization', 'No authority or identity is verified by this preflight.');
    return result(source.schemaVersion ?? null, {categories: source.categories.length, companies: source.companies.length});
  }
  return Object.freeze({examine, checkUrl});
}));
