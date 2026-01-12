# MIPS Assembly Formatter

Formats MIPS assembly (should be labelled as .asm) files with proper indentation and alignment.

## Usage

Open a `.asm` file and format document command.

The formatter will automatically:
- Indent code inside functions with tabs
- Align `.data` section declarations
- Preserve comments and strings
- Format multi-line data properly

## Compiling

To compile and test, run
```batchfile
vsce package
```
the `/.vscode/launch.json` apparently allows you to test the extension in a new window by doing `f5`.