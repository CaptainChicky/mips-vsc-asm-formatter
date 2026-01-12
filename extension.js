const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('asmformat is active!');

	// Register for multiple language IDs
	const formatter = vscode.languages.registerDocumentFormattingEditProvider(
		['asm', 'mips', 'mips-asm', 'assembly'], 
		{
			provideDocumentFormattingEdits(document) {
				const firstLine = document.lineAt(0);
				const lastLine = document.lineAt(document.lineCount - 1);
				const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
				
				const formattedText = format(document.getText());
				
				return [vscode.TextEdit.replace(textRange, formattedText)];
			}
		}
	);

	context.subscriptions.push(formatter);
}
exports.activate = activate;

function deactivate() { }

function isLabel(line) {
	const trimmed = line.trim();
	// Check if line contains a colon (label) before any comment
	const commentPos = trimmed.indexOf('#');
	const colonPos = trimmed.indexOf(':');
	
	if (colonPos === -1) return false;
	if (commentPos === -1) return true;
	return colonPos < commentPos;
}

function isSectionDirective(line) {
	const trimmed = line.trim();
	// .text and .data can have addresses after them like ".data 0xFFFF0000"
	return trimmed === '.text' || trimmed === '.data' || 
	       trimmed.startsWith('.text ') || trimmed.startsWith('.data ');
}

function isCommentOnly(line) {
	const trimmed = line.trim();
	return trimmed.startsWith('#');
}

function isPreserveIndentComment(line) {
	// Comments starting with #! should preserve their original indentation
	const trimmed = line.trim();
	return trimmed.startsWith('#!');
}

function isStandaloneDirective(line) {
	// Directives that stand alone and aren't part of data declarations
	const trimmed = line.trim();
	return trimmed.startsWith('.eqv ') || trimmed.startsWith('.equ ') ||
	       trimmed.startsWith('.macro ') || trimmed.startsWith('.include ') ||
	       trimmed.startsWith('.globl ') || trimmed.startsWith('.global ') ||
	       trimmed.startsWith('.extern ') || trimmed.startsWith('.section ');
}

function isDataDirective(line) {
	// Data directives that are part of variable declarations
	const trimmed = line.trim();
	return trimmed.startsWith('.word') || trimmed.startsWith('.byte') ||
	       trimmed.startsWith('.half') || trimmed.startsWith('.halfword') ||
	       trimmed.startsWith('.hword') || trimmed.startsWith('.dword') ||
	       trimmed.startsWith('.double') || trimmed.startsWith('.float') ||
	       trimmed.startsWith('.ascii') || trimmed.startsWith('.asciiz') ||
	       trimmed.startsWith('.space') || trimmed.startsWith('.align');
}

function extractStrings(line) {
	// Extract all strings (both " and ') and replace with placeholders
	const strings = [];
	let stringIndex = 0;
	
	let inString = false;
	let currentQuote = null;
	let processed = '';
	let currentString = '';
	
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		
		if (!inString && (char === '"' || char === "'")) {
			// Start of string
			inString = true;
			currentQuote = char;
			currentString = char;
		} else if (inString && char === currentQuote && line[i-1] !== '\\') {
			// End of string (not escaped)
			currentString += char;
			const placeholder = `__STRING_${stringIndex}__`;
			strings.push(currentString);
			processed += placeholder;
			stringIndex++;
			currentString = '';
			inString = false;
			currentQuote = null;
		} else if (inString) {
			// Inside string
			currentString += char;
		} else {
			// Outside string
			processed += char;
		}
	}
	
	// If we ended while still in a string, add it anyway
	if (inString) {
		processed += currentString;
	}
	
	return { processed, strings };
}

function restoreStrings(line, strings) {
	// Replace placeholders back with original strings
	let result = line;
	for (let i = 0; i < strings.length; i++) {
		result = result.replace(`__STRING_${i}__`, strings[i]);
	}
	return result;
}

function splitCodeAndComment(line) {
	// FIRST extract strings to avoid treating # inside strings as comments
	const { processed, strings } = extractStrings(line);
	
	// NOW find the # in the processed line (without strings)
	const hashPos = processed.indexOf('#');
	if (hashPos === -1) {
		// No comment, restore strings to the whole line
		return { code: restoreStrings(processed, strings), comment: '' };
	}
	
	// Split and restore strings to each part
	const codePart = processed.substring(0, hashPos);
	const commentPart = processed.substring(hashPos);
	
	return {
		code: restoreStrings(codePart, strings),
		comment: restoreStrings(commentPart, strings)
	};
}

function findNextNonCommentLine(lines, startIndex) {
	// Look ahead to find the next non-comment, non-empty line
	for (let i = startIndex + 1; i < lines.length; i++) {
		const trimmed = lines[i].original.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			return lines[i];
		}
	}
	return null;
}

function format(text) {
	const code = text.trim();
	let lines = code.split("\n");
	
	// Check for format disable regions
	let formatDisabled = false;
	let disabledRegions = [];
	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (trimmed === '# DO NOT FORMAT START' || trimmed === '#DO NOT FORMAT START') {
			formatDisabled = true;
			disabledRegions.push({ start: i, end: -1 });
		} else if (trimmed === '# DO NOT FORMAT END' || trimmed === '#DO NOT FORMAT END') {
			if (formatDisabled && disabledRegions.length > 0) {
				disabledRegions[disabledRegions.length - 1].end = i;
			}
			formatDisabled = false;
		}
	}
	
	// First pass: split into code and comments, normalize code but preserve strings
	for (let i = 0; i < lines.length; i++) {
		// Check if this line is in a disabled region
		let inDisabledRegion = false;
		for (let region of disabledRegions) {
			if (i >= region.start && (region.end === -1 || i <= region.end)) {
				inDisabledRegion = true;
				break;
			}
		}
		
		if (inDisabledRegion) {
			// Preserve the line exactly as-is
			lines[i] = { original: lines[i], code: lines[i], comment: '', disabled: true };
			continue;
		}
		
		const parts = splitCodeAndComment(lines[i]);
		let codePart = parts.code.trim();
		
		// Extract strings again for processing
		const { processed, strings } = extractStrings(codePart);
		
		// Process only the code outside of strings
		if (processed) {
			// Normalize commas (add space after comma if not present)
			let processedCode = processed.replace(/,(\S)/g, ', $1');
			// Remove multiple spaces
			processedCode = processedCode.replace(/ +/g, ' ');
			// Restore the strings
			codePart = restoreStrings(processedCode, strings);
		}
		
		lines[i] = { original: lines[i], code: codePart, comment: parts.comment.trim(), disabled: false };
	}
	
	// Find all .data sections and calculate alignment for each
	let dataSections = [];
	let currentDataStart = -1;
	
	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].code.trim();
		if (trimmed.startsWith('.data')) {
			if (currentDataStart !== -1) {
				// End previous data section
				dataSections.push({ start: currentDataStart, end: i });
			}
			currentDataStart = i;
		} else if (trimmed.startsWith('.text')) {
			if (currentDataStart !== -1) {
				// End data section
				dataSections.push({ start: currentDataStart, end: i });
				currentDataStart = -1;
			}
		}
	}
	// Handle data section at end of file
	if (currentDataStart !== -1) {
		dataSections.push({ start: currentDataStart, end: lines.length });
	}
	
	// Calculate max label length for each data section
	for (let section of dataSections) {
		let maxLabelLength = 0;
		for (let i = section.start + 1; i < section.end; i++) {
			const line = lines[i];
			const trimmed = line.code.trim();
			// Skip standalone directives, comments, and empty lines
			if (isStandaloneDirective(line.original) || isCommentOnly(line.original) || !trimmed) {
				continue;
			}
			if (trimmed.includes(':')) {
				const colonPos = trimmed.indexOf(':');
				maxLabelLength = Math.max(maxLabelLength, colonPos);
			}
		}
		section.maxLabelLength = maxLabelLength;
	}
	
	// Process each line
	let currentFunction = null;
	let functionLines = [];
	let result = [];
	let inMacro = false;
	let inTextSection = false; // Track if we're in a .text section
	let inMultiLineData = false; // Track if we're in a multi-line data block
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.code.trim();
		
		// If line is in a disabled region, output as-is
		if (line.disabled) {
			// Flush any pending function first
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			result.push(line.original);
			continue;
		}
		
		// Handle macro start
		if (trimmed.startsWith('.macro ')) {
			// Flush any pending function
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			inMacro = true;
			result.push(trimmed + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle macro end
		if (trimmed === '.end_macro') {
			// Flush any pending function before ending macro
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			inMacro = false;
			result.push(trimmed + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle section directives (.text, .data)
		if (isSectionDirective(line.original)) {
			// Flush any pending function
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			result.push(trimmed + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle other directives (.globl, .global, .extern, .section, etc.) - indent them
		// BUT skip data directives when in a data section (they're handled later)
		if (trimmed.startsWith('.') && !trimmed.includes(':')) {
			// Check if we're in a data section
			let inDataSection = false;
			for (let section of dataSections) {
				if (i > section.start && i < section.end) {
					inDataSection = true;
					break;
				}
			}
			
			// If in data section and this is a data directive, skip - it'll be handled in the data section handler
			if (inDataSection && isDataDirective(line.original)) {
				// Don't handle here, let it fall through to data section handler
			} else {
				// Regular directive - flush function and indent
				if (currentFunction !== null) {
					result.push(...formatFunction(functionLines));
					functionLines = [];
					currentFunction = null;
				}
				result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
				continue;
			}
		}
		
		// Check if we're in a data section
		let inDataSection = false;
		let dataSection = null;
		for (let section of dataSections) {
			if (i > section.start && i < section.end) {
				inDataSection = true;
				dataSection = section;
				break;
			}
		}
		
		// Handle .data section
		if (inDataSection) {
			// Comment-only line in .data section - ends multi-line data block
			if (isCommentOnly(line.original)) {
				inMultiLineData = false;
				// If it's a preserve-indent comment (#!), output as-is
				if (isPreserveIndentComment(line.original)) {
					result.push(line.original);
				} else {
					result.push(line.comment);
				}
				continue;
			}
			
			// Empty line ends multi-line data block
			if (!trimmed && !line.comment) {
				inMultiLineData = false;
				result.push('');
				continue;
			}
			
			// Data declaration with label
			if (trimmed.includes(':')) {
				const colonPos = trimmed.indexOf(':');
				const label = trimmed.substring(0, colonPos);
				const rest = trimmed.substring(colonPos + 1).trim();
				
				// End any previous multi-line data block
				inMultiLineData = false;
				
				if (rest) {
					// Label with data on same line - align the data part
					const spaces = ' '.repeat(dataSection.maxLabelLength - label.length + 1);
					result.push('\t' + label + ':' + spaces + rest + (line.comment ? ' ' + line.comment : ''));
				} else {
					// Label only, data on next lines - start multi-line data block
					result.push('\t' + label + ':');
					inMultiLineData = true;
				}
				continue;
			}
			
			// Check if this is multi-line data continuation or standalone directive
			const isDataDir = isDataDirective(line.original);
			const isStandaloneDir = isStandaloneDirective(line.original);
			const isStringOrValue = !trimmed.startsWith('.') && trimmed.length > 0;
			
			// If we're in a multi-line data block, continue double-indenting data directives/strings
			if (inMultiLineData && (isDataDir || isStringOrValue)) {
				result.push('\t\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			}
			// Standalone directives end multi-line data block
			else if (isStandaloneDir) {
				inMultiLineData = false;
				result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			}
			// Data directive - check if it has data after it
			else if (isDataDir) {
				// Check if directive has data after it (e.g., ".byte 1 2 3" vs just ".byte")
				const directiveMatch = trimmed.match(/^\.\w+\s+/);
				const hasDataAfter = directiveMatch && trimmed.length > directiveMatch[0].length;
				
				if (hasDataAfter) {
					// Has data, single indent and end block
					inMultiLineData = false;
					result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
				} else {
					// No data after directive, start multi-line block
					result.push('\t\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
					inMultiLineData = true;
				}
			}
			// String/value not in multi-line block - double indent (continuation of something)
			else if (isStringOrValue) {
				result.push('\t\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			}
			// Other lines
			else {
				inMultiLineData = false;
				result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			}
			continue;
		}
		
		// Handle labels (function names)
		if (isLabel(line.original)) {
			// Flush previous function if exists
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
			}
			currentFunction = trimmed;
			result.push(trimmed + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle comment-only lines - always look ahead
		if (isCommentOnly(line.original)) {
			// If it's a preserve-indent comment (#!), output as-is with original indentation
			if (isPreserveIndentComment(line.original)) {
				result.push(line.original);
				continue;
			}
			
			// Look ahead to see if next non-comment line is a label or directive
			const nextLine = findNextNonCommentLine(lines, i);
			const nextTrimmed = nextLine ? nextLine.code.trim() : '';
			
			// Don't indent if comment is right before: function label, .data, .text, or other directives
			if (nextLine && (isLabel(nextLine.original) || 
			                 isSectionDirective(nextLine.original) ||
			                 nextTrimmed.startsWith('.'))) {
				// This comment is right before a special line, don't indent
				// If we're in a function, flush it first
				if (currentFunction !== null) {
					result.push(...formatFunction(functionLines));
					functionLines = [];
					currentFunction = null;
				}
				result.push(line.comment);
			} else {
				// Not before a function/directive
				if (currentFunction !== null) {
					// Inside a function, accumulate to be indented
					functionLines.push(line);
				} else {
					// Outside a function
					// In macros or .text sections, indent comments like code
					if (inMacro || inTextSection) {
						result.push('\t' + line.comment);
					} else {
						result.push(line.comment);
					}
				}
			}
			continue;
		}
		
		// Empty line
		if (!trimmed && !line.comment) {
			if (currentFunction !== null) {
				functionLines.push(line);
			} else {
				result.push('');
			}
			continue;
		}
		
		// Accumulate lines within a function
		if (currentFunction !== null) {
			functionLines.push(line);
		} else {
			// Lines outside any function or section
			// In macros, indent all code by default (unless it's a label or directive)
			if (inMacro && trimmed && !isLabel(line.original) && !trimmed.startsWith('.')) {
				result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			} else {
				result.push(trimmed + (line.comment ? ' ' + line.comment : ''));
			}
		}
	}
	
	// Flush any remaining function
	if (currentFunction !== null) {
		result.push(...formatFunction(functionLines));
	}
	
	return result.join('\n') + '\n';
}

function formatFunction(lines) {
	const result = [];
	
	// Find max code length for inline comment alignment
	let maxCodeLength = 0;
	for (const line of lines) {
		if (line.code && !isCommentOnly(line.original)) {
			// Code line: calculate length with one tab
			maxCodeLength = Math.max(maxCodeLength, line.code.length + 4); // +4 for the tab
		}
	}
	
	// Add 1 space after the longest code line for comment alignment
	const commentColumn = maxCodeLength + 1;
	
	for (const line of lines) {
		// Comment-only line: indent with one tab
		if (isCommentOnly(line.original)) {
			result.push('\t' + line.comment);
		}
		// Code line with possible inline comment
		else if (line.code) {
			const codeLine = '\t' + line.code;
			if (line.comment) {
				const padding = ' '.repeat(Math.max(1, commentColumn - codeLine.length));
				result.push(codeLine + padding + line.comment);
			} else {
				result.push(codeLine);
			}
		}
		// Empty line
		else if (!line.comment) {
			result.push('');
		}
	}
	
	return result;
}

module.exports = {
	activate,
	deactivate
}