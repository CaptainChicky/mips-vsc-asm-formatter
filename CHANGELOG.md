# Change Log
## v1.2.0
- Added: Macro support - macros are formatted as text templates without extra indentation
- Added: Multi-line data declarations with empty labels now properly double-indent continuation lines
- Added: Support for data directives without inline data (e.g., `.byte` on its own line)
- Added: "DO NOT FORMAT" regions - wrap code in `# DO NOT FORMAT START/END` to preserve custom formatting
- Fixed: Comments before labels and directives are no longer incorrectly indented
- Fixed: Data directives (`.double`, `.word`, etc.) in `.data` sections now properly track multi-line blocks
- Fixed: Comments in macros and `.text` sections are now properly indented
- Fixed: Standalone data directives no longer treated as multi-line continuations
- Improved: Better detection of multi-line data blocks - stops at comments, empty lines, or non-data directives
- Added: Support for `.hword` and `.dword` data directives

## v1.1.0
- Complete rewrite of formatting logic for MIPS assembly by CC
- Now works with VS Code's built-in "Format Document" command (Shift+Alt+F)
- Fixed: Strings are now properly preserved (no modifications inside quotes)
- Fixed: Comments with `#` inside strings no longer break formatting
- Added: Multi-line data declarations are now properly indented
- Added: Proper alignment for `.data` section variables
- Improved: Comment alignment in functions (1 space after longest line)
- Added: Support for directives like `.globl`, `.global`, `.extern`, `.section`
- Changed: Uses `#` for comments (MIPS standard) instead of `;`

## v1.0.0
- Initial release by NotAFlyingGoose (https://github.com/NotAFlyingGoose/AsmFormat)