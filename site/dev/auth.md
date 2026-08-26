---
outline: deep
titleTemplate: :title — PopClip Developer
---

<script setup>
import ObscureTool from '../src/ObscureTool.vue'
</script>

# Authenticating to external services

Extensions that talk to an external service on the user's behalf usually need
a credential of some kind. This page describes the tools PopClip provides for
signing in to services and storing secrets.

## The simplest way: an API key option

If the service just needs an API key that the user can obtain and paste in,
you don't need any special machinery. Define an [option](./config#the-options-array)
of type `secret`: it appears as a concealed text field, and PopClip stores
the value in the user's keychain.

For anything more involved — validating a username and password, or an OAuth
sign-in — use the `auth` function, described next.

## The `auth` function

A [module-based extension](./js-modules) can define an
[`auth` function](/dev/api/interfaces/Extension.html#auth). When it does,
PopClip shows a **Sign in** button in the action's settings UI, and calls the
function when the user clicks it:

```ts
type AuthFunction = (
  info: AuthInfo,
  flow: AuthFlowFunction,
) => Promise<string | AuthResult>;
```

The [`info` object](/dev/api/interfaces/AuthInfo.html) carries the values of
the extension's `username` and `password` options (if defined), the
extension's name and identifier, and a `redirect` URL for use in OAuth flows.

Whatever the function returns is saved in the user's keychain as the
extension's `authsecret`, and the settings UI switches to a signed-in state
with a **Sign out** button (which clears the stored secret). Return a plain
string, or an [AuthResult](/dev/api/interfaces/AuthResult.html) object
`{ secret, label, expiresIn }` — the `label` is shown as the signed-in
account identifier, and `expiresIn` (a token lifetime in seconds) makes
PopClip treat the sign-in as expired after that time.

## Username and password sign-in

For services that authenticate with a username and password, define options
with the identifiers `username` and `password`. PopClip passes their values
to the `auth` function in `info`. An option of type `password` is never
stored — it exists only to be passed to the `auth` function.

The [Pinboard extension](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/Pinboard.popclipext)
uses this pattern to retrieve the user's API token:

```ts
export const options: Option[] = [
  { identifier: "username", type: "string", label: "Username" },
  { identifier: "password", type: "password", label: "Password" },
];

export const auth: AuthFunction = async (info) => {
  // validate the credentials by fetching the user's API token
  const response = await axios.get(
    "https://api.pinboard.in/v1/user/api_token",
    { auth: info, params: { format: "json" } }, // HTTP basic authentication
  );
  return response.data.result;
};
```

::: info `secret` vs `password` options

Both option types conceal their input; the difference is what happens to the
value. A `secret` option is stored in the user's keychain, for a credential
the extension keeps and uses — typically a pasted API key. A `password`
option is never stored: the `auth` function uses it once to obtain a token
from the service, and only the token is kept. PopClip never retains the
user's actual password.

:::

## OAuth sign-in

For OAuth authorization-code flows, use the `flow` callback passed as the
`auth` function's second parameter. Calling it opens the service's
authorization page in the user's browser, with your parameters appended.
After the user approves, the service redirects the browser to the
`info.redirect` URL — a local address that PopClip itself serves — and
`flow` resolves with the query parameters you named in `expect`:

```ts
export const auth: AuthFunction = async (info, flow) => {
  // step 1: the user authorizes the extension in their browser
  const { code } = await flow(
    "https://example.com/oauth/authorize",
    { client_id, redirect_uri: info.redirect },
    ["code"],
  );
  // step 2: exchange the authorization code for an access token
  const { data } = await axios.post("https://example.com/oauth/token", {
    grant_type: "authorization_code",
    code,
    client_id,
    client_secret,
    redirect_uri: info.redirect,
  });
  return { secret: data.access_token, expiresIn: data.expires_in };
};
```

The [Raindrop.io extension](https://github.com/pilotmoon/PopClip-Extensions/tree/master/source/RaindropIO.popclipext)
is a complete working example of this pattern.

For services still using OAuth 1.0a request signing, the
[`oauth-1.0a`](./js-environment#using-require) library is bundled in
PopClip's JavaScript environment.

## Using the stored secret

Action code reads the stored secret as `options.authsecret`. It has one
special behaviour: accessing it while the extension is not signed in throws
an error, so an action that requires sign-in fails with a "Not signed in"
message rather than proceeding with an empty credential.

```ts
export const action: Action = {
  requirements: ["url"],
  async code(input, options) {
    await axios.post(
      "https://example.com/api/save",
      { url: input.data.urls[0] },
      { headers: { Authorization: `Bearer ${options.authsecret}` } },
    );
    popclip.showSuccess();
  },
};
```

If the service rejects the stored secret — an expired or revoked token, say —
throw the error returned by
[`popclip.signInRequiredError()`](/dev/api/interfaces/PopClip.html#signinrequirederror).
PopClip clears the saved secret, so the extension shows as signed out, and
opens the settings UI for the user to sign in again. (The related
[`popclip.settingsRequiredError()`](/dev/api/interfaces/PopClip.html#settingsrequirederror)
sends the user to settings _without_ signing them out — for example when a
required option is missing.)

## Client identifiers, and `util.clarify`

There is a wrinkle with OAuth: the flow needs a client identifier, and
usually a client secret, issued to the extension by the service — and there
is nowhere to hide them. They have to ship inside the extension, and an
extension is source code that anyone can read.

The [`util.clarify`](/dev/api/interfaces/Util.html#clarify) function takes
the edge off. It deciphers a JSON object that has been lightly obscured —
Base64, then ROT13 — so the credentials at least don't sit in the source as
plaintext, where they could be scraped or indexed:

```ts
import { client } from "./client.json"; // { "client": "<obscured string>" }
const { client_id, client_secret } = util.clarify(client);
```

To be clear: this is obfuscation and not security. Anyone determined can recover the values by reversing the process. That is an accepted limitation. Client credentials are embedded in ordinary apps too, and can be extracted from them just the same. Publish accordingly: treat an extension's client credentials as protected from casual exposure rather than secret.

To prepare an obscured blob, apply the reverse of `clarify` to your JSON:
encode it as Base64, then apply ROT13 to the result. You can do it right
here:

<ObscureTool />

Or do the same with Node:

```js
// obscure.mjs — run with: node obscure.mjs
const credentials = { client_id: "abc123", client_secret: "shhh" };
const base64 = Buffer.from(JSON.stringify(credentials)).toString("base64");
const obscured = base64.replace(/[a-z]/gi, (c) =>
  String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < "n" ? 13 : -13)),
);
console.log(obscured);
// -> rlWwoTyyoaEsnJDvBvWuLzZkZwZvYPWwoTyyoaEsp2IwpzI0Vwbvp2ubnPW9
```

The printed string is what goes in the extension — the value of the
`client` key in the `client.json` of the example above — ready to be read
back with `util.clarify` at load time.

Finally, note that some services support [PKCE](https://oauth.net/2/pkce/),
a variant of OAuth designed for apps that cannot keep secrets. With PKCE
there is no client secret at all — only the client identifier ships in the
extension. If the service you are integrating with offers it, prefer it:
the less there is to obscure, the better.

## Related config keys

- [`auth service label`](./config#top-level-properties) — a label for the
  service, used in prompts such as "Sign in to your [label] account".
  Defaults to the extension's name.
