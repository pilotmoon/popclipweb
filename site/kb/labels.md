# Release labelling

## Terminology

The documentation uses the following terms to refer to releases:

- **Edition:** Refers to Standalone, Mac App Store or Setapp edition. See: [Obtaining PopClip](/guide/install#obtaining-popclip).
- **Channel:** Refers to the set of [Production](/download) or [Beta](/beta) releases of each edition.

## Version numbering

PopClip versions are presented in the form `version string (build number)`, for
example `2023.7 (4151)`, with the following meaning:

- **Version string:**

  - **Production releases:** Production releases of PopClip have a version
    string in the form `year.month`, e.g. `2023.7`, corresponding to when the
    version was released. In case of multiple releases in the same month, a
    third number is added, e.g. `2023.7.1`.

  - **Beta releases:** Beta versions have version strings such as `Build 4151`
    which are not related to the release date.

- **Build number:** The number in parentheses after the version number is the
  build number, which is consistent across all editions and release channels,
  except that the Mac App Store edition build number is always 1000000 higher
  than the other editions. For example, version `2023.7 (4151)` of the
  Standalone Edition is the same version as `2023.7 (1004151)` of the Mac App
  Store Edition.
