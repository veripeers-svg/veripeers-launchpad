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
- Submit validated public inquiries through a POST server function and a write-only RLS-scoped client; never expose submitted personal information to visitors.
- Owner email notifications require a configured Lovable sender domain and the scaffolded managed email helper; never report notification delivery before that service is wired and checked.
- Interpret the launch date at midnight in India, and clamp elapsed countdowns at zero to avoid misleading negative timers.
- Keep private inquiry reads behind authenticated server functions with a database-backed administrator role check and matching read-only RLS; route gates alone cannot protect personal information.
- Keep administrator accounts in managed Auth and roles in a separate protected user_roles table; never embed credentials or enable public administrator registration.
- Use the managed client-only authenticated layout for private administration and one root identity-change subscriber; clear private query caches before sign-out to prevent retained submissions.
- Export every src asset pointer into its matching static publish path during Netlify builds; external hosts do not provide Lovable's asset-serving middleware, so media must be included in the deployment and failed downloads must fail the build.
