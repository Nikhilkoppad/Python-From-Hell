import * as monaco from 'monaco-editor';
import 'monaco-editor/min/vs/editor/min.css';
import React, { useRef, useEffect } from 'react';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      wordWrap: 'on',
      value: value,
    });

    // Sync value back to parent on every change
    const handleInput = () => {
      onChange(editor.getValue());
    };
    editor.onDidChangeModelContent(handleInput);

    // Cleanup
    return () => {
      editor.dispose();
    };
  }, [language, onChange]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '300px',
        border: '1px solid #4a0a0a',
        borderRadius: 4,
        overflow: 'hidden',
        background: '#1e1e1e',
      }}
    />
  );
};