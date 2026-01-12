const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('asmformat is active!');

	// Register as a document formatter for .asm files
	const formatter = vscode.languages.registerDocumentFormattingEditProvider('asm', {
		provideDocumentFormattingEdits(document) {
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);
			const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
			
			const formattedText = format(document.getText());
			
			return [vscode.TextEdit.replace(textRange, formattedText)];
		}
	});

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
	// Only .text and .data should be unindented
	return trimmed === '.text' || trimmed === '.data' || 
	       trimmed.startsWith('.text ') || trimmed.startsWith('.data ');
}

function isCommentOnly(line) {
	const trimmed = line.trim();
	return trimmed.startsWith('#');
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

function extractStrings(line) {
	// Extract all strings (both " and ') and replace with placeholders
	const strings = [];
	let result = line;
	let stringIndex = 0;
	
	// Handle double quotes
	let inString = false;
	let currentQuote = null;
	let processed = '';
	let currentString = '';
	
	for (let i = 0; i < result.length; i++) {
		const char = result[i];
		
		if (!inString && (char === '"' || char === "'")) {
			// Start of string
			inString = true;
			currentQuote = char;
			currentString = char;
		} else if (inString && char === currentQuote && result[i-1] !== '\\') {
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

function isInDataSection(lines, currentIndex) {
	// Look backwards to find if we're in a .data section
	for (let i = currentIndex; i >= 0; i--) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith('.text')) return false;
		if (trimmed.startsWith('.data')) return true;
	}
	return false;
}

function isInFunction(lines, currentIndex) {
	// Look backwards to find if we're after a label (function)
	for (let i = currentIndex - 1; i >= 0; i--) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith('.text') || trimmed.startsWith('.data')) return false;
		if (isLabel(lines[i])) return true;
	}
	return false;
}

function format(text) {
	const code = text.trim();
	let lines = code.split("\n");
	
	// First pass: normalize commas and basic cleanup, but DON'T touch comments or strings
	for (let i = 0; i < lines.length; i++) {
		const parts = splitCodeAndComment(lines[i]); // This now handles strings properly
		let codePart = parts.code.trim();
		
		// Extract strings again for processing (they're already restored but we need to protect them)
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
		
		lines[i] = { original: lines[i], code: codePart, comment: parts.comment.trim() };
	}
	
	// Find .data section and calculate alignment for data declarations
	let dataStartIndex = -1;
	let dataEndIndex = -1;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].code.startsWith('.data')) {
			dataStartIndex = i;
		} else if (dataStartIndex !== -1 && lines[i].code.startsWith('.text')) {
			dataEndIndex = i;
			break;
		}
	}
	if (dataStartIndex !== -1 && dataEndIndex === -1) {
		dataEndIndex = lines.length;
	}
	
	// Calculate max label length in .data section
	let maxDataLabelLength = 0;
	if (dataStartIndex !== -1) {
		for (let i = dataStartIndex + 1; i < dataEndIndex; i++) {
			const line = lines[i];
			if (line.code && line.code.includes(':')) {
				const colonPos = line.code.indexOf(':');
				maxDataLabelLength = Math.max(maxDataLabelLength, colonPos);
			}
		}
	}
	
	// Process each section separately
	let currentFunction = null;
	let functionLines = [];
	let result = [];
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		
		// Handle directives (.text, .data)
		if (isSectionDirective(line.original)) {
			// Flush any pending function
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			result.push(line.code + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle other directives (.globl, .global, .extern, .section, etc.) - indent them
		if (line.code.trim().startsWith('.')) {
			// Flush any pending function
			if (currentFunction !== null) {
				result.push(...formatFunction(functionLines));
				functionLines = [];
				currentFunction = null;
			}
			result.push('\t' + line.code + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle .data section variables
		if (dataStartIndex !== -1 && i > dataStartIndex && i < dataEndIndex) {
			const trimmed = line.code.trim();
			
			// Check if this is a continuation line (starts with a string or directive on its own)
			const isMultilineData = !trimmed.includes(':') && !trimmed.startsWith('.') && trimmed.length > 0;
			
			if (line.code.includes(':')) {
				const colonPos = line.code.indexOf(':');
				const label = line.code.substring(0, colonPos + 1);
				const rest = line.code.substring(colonPos + 1).trim();
				const spaces = ' '.repeat(maxDataLabelLength - colonPos + 1);
				result.push(label + spaces + rest + (line.comment ? ' ' + line.comment : ''));
			} else if (isCommentOnly(line.original)) {
				// Comment-only line in .data section (not indented)
				result.push(line.comment);
			} else if (isMultilineData) {
				// Multi-line data continuation (indent with tab)
				result.push('\t' + trimmed + (line.comment ? ' ' + line.comment : ''));
			} else {
				result.push(line.code + (line.comment ? ' ' + line.comment : ''));
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
			currentFunction = line.code;
			result.push(line.code + (line.comment ? ' ' + line.comment : ''));
			continue;
		}
		
		// Handle comment-only lines outside functions
		if (isCommentOnly(line.original) && currentFunction === null) {
			result.push(line.comment);
			continue;
		}
		
		// Accumulate lines within a function
		if (currentFunction !== null) {
			functionLines.push(line);
		} else {
			// Lines outside any function or section
			result.push(line.code + (line.comment ? ' ' + line.comment : ''));
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