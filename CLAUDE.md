# Content Studio Plus

Enonic XP application that ships four admin extensions (`archive`, `layers`, `variants`, `publish-report`) on top of Content Studio. Build chain: Gradle → pnpm → Vite. A valid `enonic.platform.subscription` license is required at runtime.

## Scripts

After making changes, run `pnpm check` to verify nothing is broken. Run `pnpm fix` to auto-fix lint issues.

| Intent | Command |
|--------|---------|
| Verify (types + lint) | `pnpm check` |
| Lint-fix | `pnpm fix` |
| Build + deploy | `./gradlew deploy` |
| Fast iteration (skip install/lint/tests) | `./gradlew yolo` |
| Build against sibling `../lib-admin-ui` and `../app-contentstudio` | `./gradlew build -Penv` |

Only run Gradle when the task specifically requires it. For most changes, `pnpm check` is sufficient.

## Code Structure

- **Server**: `src/main/resources/admin/extensions/<name>/` (yaml + html + js controller per extension), `lib/`, `apis/`, `src/main/java/`
- **Client legacy** (class-based, jQuery): `src/main/resources/assets/js/` top-level (`Archive*.ts`, `extension/<name>/`)
- **Client modern** (Preact/TSX, Nanostores, Tailwind): `src/main/resources/assets/js/v6/`
- **Styles**: `src/main/resources/assets/styles/` — LESS entries listed in `vite.config.ts`
- **i18n**: `src/main/resources/i18n/cs-plus.properties`
- **Sibling deps**: `lib-admin-ui` and `lib-contentstudio` resolve to `.xp/dev/` (unpacked from maven, or replaced via `-Penv` includedBuild)

## Git & GitHub

No conventional commit prefixes. Plain descriptive language throughout.

### Issues

- **Title**: plain descriptive text — e.g. `Add filter to archive list`, `PublishDialog: add schedule button`
- **Body**: concisely explain what and why, skip trivial details
  ```
  <4–8 sentence description: what, what's affected, how to reproduce, impact>

  #### Rationale
  <why this needs to be fixed or implemented>

  #### References            ← optional
  #### Implementation Notes  ← optional

  <sub>*Drafted with AI assistance*</sub>
  ```

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Add filter to archive list #1768`
- **Without issue**: capitalized plain-English description — e.g. `Fix build`
- **Body** (optional): past tense, one line per change, 2–6 lines, backticks for code refs

### Pull Requests

- **Title**: `<Issue Title> #<number>` — matches the commit title
- **Body**: concisely explain what and why, skip trivial details. No emojis. Separate all sections with one blank line.
  ```
  <summary of changes>

  Closes #<number>

  <sub>*Drafted with AI assistance*</sub>
  ```
