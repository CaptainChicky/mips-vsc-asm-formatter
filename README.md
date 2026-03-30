# MIPS Assembly Formatter
Formats MIPS assembly (should be labelled as .asm) files with proper indentation and alignment.

## Usage
Install the extension. Open a `.asm` file and format document command. It will recongnize `.asm`, `.s`, `.mips`, and `.spim`, but just use `.asm` like a normal person.

The formatter will automatically:
- Indent code inside functions with tabs
- Align `.data` section declarations
- Preserve comments and strings
- Format multi-line data properly
- Align inline comments with 1 tab/4 spaces after the longest instruction

The formatter isn't perfect. Also, MIPS asm formatting isn't universally agreed upon. You're welcome to try AngaBlue's formatter if you like that one better.

To keep custom formatting, wrap the block of code as follows
```
# DO NOT FORMAT START
[code]
# DO NOT FORMAT END
```
To keep custom comment indentation, use the special directive
```
    #! comment indentation is kept as-is
```
See `/format-examples/` for examples of formatting of hopefully comprehensive MIPS code. The MIPS code many times will be nonsensical and do nothing. In particular, `/format-examples/data.asm`, `/format-examples/macros.asm`, and `/format-examples/text.asm` are all bogus nonsensical code only doing showcasing. `/format-examples/factorial.asm` and `/format-examples/primes.asm` are legit programs though I got from AngaBlue's repository (https://github.com/AngaBlue/asm-formatter).

Notable is the fact that string literals are protected during formatting with a hardcoded `__STRING_N__` placeholder, where `N` is a number. This is unlikely to cause issues, but in the rare off chance someone has a string literal in their code that contains `__STRING_N__`, you gotta wrap it around in the "DO NOT FORMAT" block to prevent it from being replaced with the placeholder and then not properly restored. Or... maybe just don't write code contaning this lol??? Idk what you'd be doing if you are.

*This extension **does not do syntax highlighting** or linting. It assumes your code is correct. You can use dollar signs or not use dollar signs for registers, the formatter doesn't care.*

## Compiling
To compile and test, run `vsce package` after installing the neccesary packages as follows:
1. `npm install -g @vscode/vsce` to install the packaging tool
2. `vsce package` to create a `.vsix` file
3. In VSCode: Extensions sidebar -> click on "..." -> "Install from VSIX..."

The `/.vscode/launch.json` apparently allows you to test the extension in a new window by doing `f5`, so might be useful, but when I was testing this I literally just compiled, installed the extension as detailed prior, and tested it that way. <b>You probably should do it the `f5` way though lol:</b>
1. `npm install -g @vscode/vsce` to install the packaging tool
2. Do `f5` in VSCode to open a new window with the extension loaded, and test it there

## Bugs
Again, I make no guarentee this formatter is perfect. If it breaks on some code, and wrapping code in the "do not format" blocks is too annoying, please submit a bug report/issue/pull request here: https://github.com/CaptainChicky/mips-vsc-asm-formatter

If it's urgent, email me lol (check `package.json` in the repository source code), I probably won't check github that often.

## Credits
This extension was build on the base code (v1.0.0) written by [NotAFlyingGoose](https://github.com/NotAFlyingGoose) in the following unfortunately abandoned repository: https://github.com/NotAFlyingGoose/AsmFormat

I make no claims that I wrote all of the code, and I only made additional changes detailed in the changelog in subsequent v1.1.0 and v1.2.0.