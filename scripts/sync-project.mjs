import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const repository = 'joncady/feadventures';
const gh = args => execFileSync('gh', args, { encoding: 'utf8' }).trim();
const issues = JSON.parse(readFileSync(new URL('../docs/migration-issues.json', import.meta.url), 'utf8'));
// Read all issues, including closed ones, so rerunning never duplicates a completed task.
const existing = JSON.parse(gh(['issue', 'list', '--repo', repository, '--state', 'all', '--limit', '1000', '--json', 'title,url']));
for (const issue of issues) {
  const match = existing.find(item => item.title === issue.title);
  issue.url = match?.url ?? gh(['issue', 'create', '--repo', repository, '--title', issue.title, '--body', issue.body]);
  // Save each creation before project attachment, so an interrupted sync can be resumed.
  writeFileSync(new URL('../docs/migration-issues.json', import.meta.url), JSON.stringify(issues, null, 2) + '\n');
  gh(['project', 'item-add', '2', '--owner', 'joncady', '--url', issue.url]);
  console.log(issue.url);
}
