import React from "react";
import { render } from "react-dom";
import { App } from "./components/App";

const SOURCE = `如果 (true) {} 否则 {}
si (true) {} sino {}
🤞 {
  await fetch('/api');
} 😱 (e) {
  🤷‍♀️ (e.status === 400) { alert('1'); } 🤔 { alert('2'); }
}`;
const CONFIG = [
  {
    parserOpts: {
      localizedKeywords: {
        if: "chinese",
        if: "如果",
        else: "否则"
      }
    }
  },
  {
    parserOpts: {
      localizedKeywords: {
        if: "spanish",
        if: "si",
        else: "sino"
      }
    }
  },
  {
    parserOpts: {
      localizedKeywords: {
        if: "emoji",
        if: "🤷‍♀️",
        else: "🤔",
        try: "🤞",
        catch: "😱"
      }
    }
  }
];
const PLUGIN = `export default function customPlugin(babel) {
  return {
    manipulateOptions(opts, parserOpts) {
      // parserOpts.localizedKeywords = {
      //   if: "如果",
      // };
    }
  };
}
`;

render(
  <App
    defaultBabelConfig={CONFIG}
    defaultSource={SOURCE}
    defCustomPlugin={PLUGIN}
  />,
  document.getElementById("root")
);
