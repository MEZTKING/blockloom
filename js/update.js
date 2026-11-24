/* Manual GitHub-release update check. No auto-download; the installer stays user-controlled. */

export function parseVersion(value) {
  const match = String(value || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) return null;
  return match.slice(1, 4).map(Number);
}

export function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return 0;
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  }
  return 0;
}

export function releaseInfo(release, currentVersion) {
  const latest = String(release?.tag_name || '').trim().replace(/^v/i, '');
  const url = release?.html_url || '';
  const newer = Boolean(latest) && compareVersions(latest, currentVersion) > 0;
  return {
    latest,
    url,
    newer,
    publishedAt: release?.published_at || null,
    notes: String(release?.body || '').slice(0, 4000),
  };
}
