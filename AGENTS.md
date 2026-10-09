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

## Website architecture
- Keep the pre-launch site at the index route and privacy information in a dedicated route, so primary navigation remains section-based.
- Keep inquiry schemas and launch calculations in browser-safe shared modules, so validation and date rules can be tested without rendering.
- Until an actual submission service is supplied, forms create validated email drafts and must never claim that leads were saved or sent.
- Interpret the launch date at midnight in India, and clamp elapsed countdowns at zero to avoid misleading negative timers.
