# Change Log

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