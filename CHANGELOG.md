# Change Log

## v1.2.4
- Refactored the hardcoded tab handling logic of inline comments to be more readable/maintainable (originally had +1 -> +3, now its just +4 for the tab size). This should not change any behavior but makes it easier to understand and modify in the future if needed.
- Fixed: Bug that failed checking for escaped quotes edge case (e.g. `\\"`) is fixed.
- Fixed: Rare case when there are non-space whitespace characters (\t and \r are the only two that could possibly be present) are between instructions (e.g. `li[TAB][CR]$v0,[TAB][SPACE][SPACE]4`) is now properly handled with `\s+` regex. Extremely unlikely people will do this but who knows lol.
- Noted hardcoded tab size of 4 spaces in readme for comment alignment that probably will remain as-is for the foreseeable future, but may be made configurable in the future if there is demand for it.
- Noted hardcoded `__STRING_N__` placeholder for string literals in readme that may cause collisions in the extremely unlikely case someone has a string literal that contains that pattern.
- Fixed: Colons inside string literals in `.data` sections (e.g. `.asciiz "time: 12:00"`) could corrupt label alignment by inflating the max label length calculation, or cause unlabeled directives to be misidentified as labels.

## v1.2.3
- Fixed: String literals containing colons (`:`) are no longer incorrectly treated as labels

## v1.2.2
- Fixed: Preserve-indent comments (#!) now maintain function context (code after #! comments continues to be indented as part of the same function)
- Fixed: Preserve-indent comments (#!) now output in their original position instead of being moved to after function completion.

## v1.2.1
- Fixed: Multi-line data blocks now properly end when encountering standalone directives (.eqv, etc.)

## v1.2.0
- Added: Macro support - macros are formatted as text templates without extra indentation
- Added: Multi-line data declarations with empty labels now properly double-indent continuation lines
- Added: Support for data directives without inline data (e.g., `.byte` on its own line)
- Added: "DO NOT FORMAT" regions - wrap code in `# DO NOT FORMAT START/END` to preserve custom formatting
- Added: Inline directive `#!` to keep comment indentation as-is.
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