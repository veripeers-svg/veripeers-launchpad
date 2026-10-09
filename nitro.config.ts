// Nitro server target override: build the SSR/server-function output in
// Netlify's serverless format so the site deploys on Netlify.
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "netlify",
});
