let editor, showGrid = false, gridColor = '#cccccc', gridSpacing = 10, autoRun = false;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });
require(['vs/editor/editor.main'], function () {
    const jsPDFCommands = [
        { label: "setFontSize", insertText: 'setFontSize(16);' },
        { label: "text", insertText: 'text("Hello, World!", 10, 10);' },
        { label: "save", insertText: 'save("example.pdf");' },
        { label: "rect", insertText: 'rect(10, 10, 100, 50, "S");' },
        { label: "circle", insertText: 'circle(50, 50, 20, "S");' },
        { label: "setTextColor", insertText: 'setTextColor(255, 0, 0);' }
    ];

    monaco.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['.'],
        provideCompletionItems: () => ({
            suggestions: jsPDFCommands.map(cmd => ({
                label: cmd.label,
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: cmd.insertText,
                documentation: `jsPDF Method: ${cmd.label}`
            }))
        })
    });

    editor = monaco.editor.create(document.getElementById('editor'), {
        value: `// const doc = new jsPDF();(already declared,just start coding☺)\ndoc.setFontSize(16);\ndoc.text("Hello, World!", 10, 10);\n// doc.save("example.pdf");`,
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 14,
        automaticLayout: true
    });

    editor.onDidChangeModelContent(() => {
        if (autoRun) {
            runCode(false);
        }
    });
});

document.getElementById('grid-toggle').addEventListener('change', e => {showGrid = e.target.checked;runCode(false)});
document.getElementById('grid-color').addEventListener('input', e => {gridColor = e.target.value,runCode(false)});
document.getElementById('grid-spacing').addEventListener('change', e => {gridSpacing = parseInt(e.target.value),runCode(false)});
document.getElementById('font-size').addEventListener('input', e => editor.updateOptions({ fontSize: parseInt(e.target.value) }));
document.getElementById('auto-run').addEventListener('change', e => autoRun = e.target.checked);
document.getElementById('run-code').addEventListener('click', () => runCode(true));

function runCode(showErrors) {
    const { jsPDF } = window.jspdf;

    try {
        const doc = new jsPDF();
        const userCode = editor.getValue();

        function addGrid(pdf) {
            pdf.setDrawColor(gridColor);
            pdf.setLineWidth(0.1);
            for (let x = 0; x <= 210; x += gridSpacing) pdf.line(x, 0, x, 297);
            for (let y = 0; y <= 297; y += gridSpacing) pdf.line(0, y, 210, y);
        }

        const wrappedCode = new Function('doc', userCode);
        wrappedCode(doc);

        if (showGrid) addGrid(doc);

        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        document.getElementById('pdf-preview').src = pdfURL;

    } catch (error) {
        if (showErrors) alert("Error: " + error.message);
        console.error(error);
    }
}
