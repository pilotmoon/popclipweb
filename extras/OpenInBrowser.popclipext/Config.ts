// #popclip
// identifier: com.pilotmoon.popclip.extension.open-in-browser
// name: Open in Browser
// popclipVersion: 4225
// icon: mdi-open-in-browser.svg
// entitlements: [dynamic]
// description: >-
//   Open URLs in a specific browser. Supports Safari, Chrome, Firefox, Arc, Brave, Dia,
//   DEVONagent Pro, DuckDuckGo, Edge, Mullvad, Opera, Orion, Quark, Tor Browser, Vivaldi,
//   Waterfox and Zen.
// keywords: >-
//   Safari Chrome Firefox Arc Brave Dia DEVONagent Pro DuckDuckGo Edge Mullvad Opera
//   Orion Quark Tor Browser Vivaldi Waterfox Zen

import { browsers } from "./browsers.json";

interface BrowserDefinition {
  name: string;
  bundleId: string;
  icon: string;
  homepageUrl: string;
  supportsOpenIn: boolean;
  defaultEnabled?: boolean;
}

function makeOption(browser: BrowserDefinition): Option {
  const option: Option = {
    identifier: browser.bundleId,
    label: browser.name,
    type: "boolean",
    icon: browser.icon,
    defaultValue: browser.defaultEnabled === true,
  };
  return option;
}

function makeAction(browser: BrowserDefinition): Action {
  const action: Action = {
    title: `Open in ${browser.name}`,
    icon: browser.icon,
    code: (input) => {
      for (const url of input.data.urls) {
        popclip.openUrl(url, { app: browser.bundleId });
      }
    },
    app: {
      name: browser.name,
      link: browser.homepageUrl,
      bundleIdentifiers: [browser.bundleId],
      checkInstalled: true,
    },
  };
  return action;
}

// return options with title
export const options: Option[] = [
  {
    identifier: "heading",
    label: "Enabled Browsers",
    type: "heading",
  },
  ...(browsers as BrowserDefinition[])
    .filter((browser) => browser.supportsOpenIn === true)
    .map(makeOption),
];

// dynamically generate the actions
export const actions: PopulationFunction = (input, options, context) => {
  return (browsers as BrowserDefinition[])
    .filter((browser) => {
      return (
        input.data.urls.length > 0 &&
        options[browser.bundleId] === true &&
        context.appIdentifier !== browser.bundleId
      );
    })
    .map(makeAction);
};
