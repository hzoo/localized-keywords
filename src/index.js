import React from "react";
import { render } from "react-dom";
import { App } from "./components/App";

const INPUT = [
  [
    `如果 (🥟) {
  alert("😋");
} 否则 {
  alert("😐");
}`,
    {
      parserOpts: {
        localizedKeywords: {
          if: "chinese",
          if: "如果",
          else: "否则",
        },
      },
    },
  ],
  [
    `const 🌮 = nuevo Promise();`,
    {
      parserOpts: {
        localizedKeywords: {
          new: "spanish",
          new: "nuevo",
        },
      },
    },
  ],
  [
    `🤞 {
  await fetch('/api');
} 😱 (e) {
  🤷‍ (e.status === 400) {
    alert('!');
  } 🤔 {
    alert('?');
  }
}`,
    {
      parserOpts: {
        localizedKeywords: {
          if: "emoji",
          if: "🤷‍",
          else: "🤔",
          try: "🤞",
          catch: "😱",
        },
      },
    },
  ],
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
  <App defaultInput={INPUT} defCustomPlugin={PLUGIN} />,
  document.getElementById("root")
);
