---
outline: deep
---

# iCloud Sync

PopClip can sync your actions setup between all your Macs using iCloud. This
article explains what syncs, how to turn it on and off, and what to expect.

## What is synced

When iCloud Sync is enabled, PopClip syncs:

- your installed extensions,
- the arrangement of your actions list (including folders, separators, custom
  names and icons), and
- each action's settings.

Additionally, per-action secrets such as sign-in credentials and API keys sync
securely via the **iCloud Keychain**, which is a separate mechanism from the
main sync. If iCloud Keychain is disabled on a Mac, the other items still
sync, but secrets will not.

The following are _not_ synced: PopClip's app-wide settings (the General and
App tabs of settings), and website/app exclusion rules.

::: info License sync

Independently of iCloud Sync, PopClip also saves your license key to iCloud —
that happens regardless of the iCloud Sync setting. See
[Registering the license key](/guide/install#registering-the-license-key).

:::

## Turning sync on and off

iCloud Sync is controlled from the **Tools menu** at the bottom of the
[Actions tab](/guide/settings#actions-tab) in PopClip settings. Click the
Tools menu and choose **iCloud Sync** to toggle it.

- On a **fresh install**, iCloud Sync is on by default.
- If you **updated** from an older version of PopClip, sync stays off until
  you choose to enable it.

If iCloud is not available — for example, no iCloud account is signed in on
the Mac — the Tools menu shows a message explaining why, and sync remains
off.

## How syncing behaves

All synced Macs **merge** their actions lists together to form one unified
view. When you first enable sync on a Mac that already has actions set up,
its actions are combined with whatever is already in iCloud, rather than one
replacing the other. After merging, you may want to tidy up the combined list
on one Mac — the result syncs everywhere.

Sync is not always instant. Change propagation depends on iCloud's current
conditions, but all computers will converge eventually. If a change hasn't
appeared on another Mac yet, give it a little time.

::: tip Low Power Mode

macOS reduces background iCloud activity in Low Power Mode, which can delay
sync considerably. PopClip shows a warning in the Tools menu when this may be
affecting sync.

:::

## Troubleshooting

- **Not syncing at all?** Check that both Macs are signed in to the same
  iCloud account. Then check the Tools menu: if there is a problem, a status
  message is shown under the iCloud Sync item (for example "No iCloud
  account", "iCloud is restricted", or a sync error message).
- **Secrets (sign-ins, API keys) not syncing?** Check that iCloud Keychain is
  enabled on both Macs.
- **Changes slow to appear?** This is normal, especially on battery power or
  in Low Power Mode. Changes will arrive eventually.
