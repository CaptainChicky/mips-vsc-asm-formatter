# MIPS Assembly Formatter
Formats MIPS assembly (should be labelled as .asm) files with proper indentation and alignment.

## Usage
Install the extension. Open a `.asm` file and format document command. It will recongnize `.asm`, `.s`, `.mips`, and `.spim`, but just use `.asm` like a normal person.

The formatter will automatically:
- Indent code inside functions with tabs
- Align `.data` section declarations
- Preserve comments and strings
- Format multi-line data properly

The formatter isn't perfect. Also, MIPS asm formatting isn't universally agreed upon. You're welcome to try AngaBlue's formatter if you like that one better.

To keep custom formatting, wrap the block of code as follows
```
# DO NOT FORMAT START
[code]
# DO NOT FORMAT END
```

TO keep custom comment indentation, use the special directive
```
    #! comment indentation is kept as-is
```

*This extension **does not do syntax highlighting** or linting. It assumes your code is correct. You can use dollar signs or not use dollar signs for registers, the formatter doesn't care.*

## Compiling
To compile and test, run
```
vsce package
```
after installing the neccesary packages that are like vscode, vsce and stuff (I forget which ones exactly, but it's not that hard to figure out yourself). You probably also need to `npm install` or something idk.

The `/.vscode/launch.json` apparently allows you to test the extension in a new window by doing `f5`, so might be useful, but when I was testing this I literally just compiled, installed the extension, and tested it that way.

## Bugs
Again, I make no guarentee this formatter is perfect. If it breaks on some code, and wrapping code in the "do not format" blocks is too annoying, please submit a bug report/issue/pull request here: https://github.com/CaptainChicky/mips-vsc-asm-formatter

If it's urgent, email me lol (check `package.json` in the repository source code), I probably won't check github that often.

## Credits
This extension was build on the base code (v1.0.0) written by [NotAFlyingGoose](https://github.com/NotAFlyingGoose) in the following unfortunately abandoned repository: https://github.com/NotAFlyingGoose/AsmFormat

I make no claims that I wrote all of the code, and I only made additional changes detailed in the changelog in subsequent v1.1.0 and v1.2.0.