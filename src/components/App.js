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
  onConfigChange,
  removeConfig
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
        size: new Blob([code], { type: "text/plain" }).size
      });
    } catch (e) {
      setCompiled({
        code: e.message,
        error: true
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
        <Code
          value={compiled?.code ?? ""}
          docName="result.js"
          config={{ readOnly: true, lineWrapping: true }}
          isError={compiled?.error ?? false}
        />
      </Section>
      <Toggle onClick={removeConfig} />
    </Wrapper>
  );
}

export const App = ({ defaultSource, defaultBabelConfig, defCustomPlugin }) => {
  const [source, setSource] = React.useState(defaultSource);
  const debouncedSource = useDebounce(source, 125);

  const [enableCustomPlugin, toggleCustomPlugin] = React.useState(false);
  const [customPlugin, setCustomPlugin] = React.useState(defCustomPlugin);

  const [babelConfig, setBabelConfig] = useState(
    Array.isArray(defaultBabelConfig)
      ? defaultBabelConfig
      : [defaultBabelConfig]
  );
  const updateBabelConfig = useCallback((config, index) => {
    setBabelConfig(configs => {
      const newConfigs = [...configs];
      newConfigs[index] = config;

      return newConfigs;
    });
  }, []);
  const removeBabelConfig = useCallback(index => {
    setBabelConfig(configs => configs.filter((c, i) => index !== i));
  }, []);

  let results = babelConfig.map((config, index) => {
    return (
      <CompiledOutput
        source={debouncedSource}
        customPlugin={enableCustomPlugin ? customPlugin : undefined}
        config={config}
        key={index}
        onConfigChange={config => updateBabelConfig(config, index)}
        removeConfig={() => removeBabelConfig(index)}
      />
    );
  });

  return (
    <Root>
      <Section>
        <Actions>
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
              setBabelConfig(configs => [
                ...configs,
                configs[configs.length - 1]
              ])
            }
          >
            New Language
          </button>
          {/* <button
            onClick={() => {
              setSource("const hello = 'world';");
            }}
          >
            Use Example (WIP)
          </button> */}
        </Actions>

        <Wrapper>
          <Code
            value={source}
            onChange={val => setSource(val)}
            docName="source.js"
          />
          {/* <AST source={source}></AST> */}
        </Wrapper>

        {enableCustomPlugin && (
          <Wrapper>
            <Code
              value={customPlugin}
              onChange={val => setCustomPlugin(val)}
              docName="plugin.js"
            />
            <Toggle onClick={() => toggleCustomPlugin(false)} />
          </Wrapper>
        )}
        {/* output code and config section*/}
        {results}
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

  ${p =>
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
  padding: 1rem;

  button {
    margin-left: 1rem;
  }
`;
