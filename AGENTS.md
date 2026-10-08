<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Read public news directly from the source WordPress REST API with URL-based filters and pagination and TanStack Query caching; this preserves the original editorial source without storing duplicate articles.
- Keep the shared radio provider in the root news shell so playback survives internal navigation and only starts after a user action.
- Sanitize remote article HTML with an allowlist before rendering to preserve editorial content without executable code.
- Use CDN asset pointers for imported article photographs and the source masthead; dynamically published photos remain sourced from the editorial API.
