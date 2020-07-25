import React, { useState, useCallback, useEffect } from "react";
// import * as Babel from "@babel/standalone";
import * as Babel from "@babel/core";
import styled, { css } from "styled-components";

import { Editor } from "./Editor";
import { processOptions } from "../standalone";

window.babel = Babel;

function CompiledOutput({
  source,
  customPlugin,
  config,
  onSourceChange,
  onConfigChange,
  removeInput,
}) {
  const [compiled, setCompiled] = useState(null);
  const debouncedPlugin = useDebounce(customPlugin, 125);

  useEffect(() => {
    try {
      const { code } = Babel.transform(
        source,
        processOptions(config, debouncedPlugin)
      );
      setCompiled({
        code,
        size: new Blob([code], { type: "text/plain" }).size,
      });
    } catch (e) {
      setCompiled({
        code: e.message,
        error: true,
      });
    }
  }, [source, config, debouncedPlugin]);

  return (
    <Wrapper>
      <Section>
        <Config
          value={
            config === Object(config)
              ? JSON.stringify(config, null, "\t")
              : config
          }
          onChange={onConfigChange}
          docName="config.json"
          config={{ mode: "application/json" }}
        />
      </Section>
      <Section>
        <Code value={source} onChange={onSourceChange} docName="source.js" />
      </Section>
      <Section>
        <Code
          value={compiled?.code ?? ""}
          docName="result.js"
          config={{ readOnly: true, lineWrapping: true }}
          isError={compiled?.error ?? false}
        />
      </Section>
      <Toggle onClick={removeInput} />
    </Wrapper>
  );
}

export const App = ({ defaultSource, defaultInput, defCustomPlugin }) => {
  const [enableCustomPlugin, toggleCustomPlugin] = React.useState(false);
  const [customPlugin, setCustomPlugin] = React.useState(defCustomPlugin);

  const [input, setInput] = useState(
    Array.isArray(defaultInput) ? defaultInput : [defaultInput]
  );
  const updateInput = useCallback((value, index, config) => {
    setInput((inputs) => {
      const newInputs = [...inputs];
      newInputs[index][config] = value;
      return newInputs;
    });
  }, []);
  const removeInput = useCallback((index) => {
    setInput((inputs) => inputs.filter((c, i) => index !== i));
  }, []);

  let sections = input.map((value, index) => {
    let [source, config] = value;
    return (
      <CompiledOutput
        source={source}
        customPlugin={enableCustomPlugin ? customPlugin : undefined}
        config={config}
        key={index}
        onSourceChange={(value) => updateInput(value, index, 0)}
        onConfigChange={(value) => updateInput(value, index, 1)}
        removeInput={() => removeInput(index)}
      />
    );
  });

  return (
    <Root>
      <Section>
        <Actions>
          <h3>Localized JavaScript Keywords </h3>
          {/* <label>
            <input
              checked={enableCustomPlugin}
              onChange={() => toggleCustomPlugin(!enableCustomPlugin)}
              type="checkbox"
            />
            <span>Custom Plugin</span>
          </label> */}
          <button
            onClick={() =>
              setInput((configs) => [...configs, configs[configs.length - 1]])
            }
          >
            Add Language 🌐
          </button>
          <button>
            <a href="https://github.com/hzoo/localized-keywords">GitHub</a>
          </button>
          {/* <button
            onClick={() => {
              setSource("const hello = 'world';");
            }}
          >
            Use Example (WIP)
          </button> */}
        </Actions>

        {enableCustomPlugin && (
          <Wrapper>
            <Code
              value={customPlugin}
              onChange={(val) => setCustomPlugin(val)}
              docName="plugin.js"
            />
            <Toggle onClick={() => toggleCustomPlugin(false)} />
          </Wrapper>
        )}
        {sections}
      </Section>
    </Root>
  );
};

// UTILS

function Toggle(props) {
  return <ToggleRoot {...props}>x</ToggleRoot>;
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return debouncedValue;
}

// STYLES

const Root = styled.div`
  display: flex;
  flex-direction: column;
  // height: 100%;
  height: 100vh;
  padding: 4px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  position: relative;
`;

const Wrapper = styled.div`
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0.25rem 1rem 0.75rem;
  position: relative;

  & + & {
    margin-top: 1px;
  }
`;

const Config = styled(Editor)`
  padding: 4px;
`;

const Code = styled(Editor)`
  padding: 4px;
  width: 100%;

  ${(p) =>
    p.isError &&
    css`
      background: rgba(234, 76, 137, 0.2);
    `};
`;

const ToggleRoot = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  padding: 0.25rem;
  position: absolute;
  right: 1px;
  transition: color 0.25s ease-out;
  top: -1px;
  width: 20px;
  z-index: 2;

  &:hover {
    color: red;
  }
`;

const Actions = styled(Wrapper)`
  border-bottom: 1px solid rgba(36, 40, 42, 1);
  padding: 0.5rem;
  justify-content: space-between;
  button {
    margin-left: 1rem;
  }
`;
