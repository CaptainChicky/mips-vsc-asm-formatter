# ============================================================================
# MIPS Assembly Formatter - Comprehensive Example File
# ============================================================================
# This file demonstrates all formatting features of the MIPS Assembly Formatter
# extension for VS Code. Use "Format Document" (Shift+Alt+F) to apply formatting.

# ----------------------------------------------------------------------------
# MACROS
# ----------------------------------------------------------------------------
# Macros are formatted as text templates with no extra indentation
# Code inside macros follows the same rules as normal code

.macro lstr %rd, %str
#comment
.data #comment
	lstr_message: .asciiz %str #comment
# comment
.text
	# comment (indented in .text section)
	la %rd, lstr_message
	li $v0, 1 # inline comment
#comment (not indented - before label)
base_case:
	#comment (indented - inside function)
	li $v0, 1    # inline comment aligned
	jr $ra       # Return
.end_macro

# Macro with local labels (jump targets)
.macro min %rd, %rs, %rt
	#comment
	move %rd, %rs # inline comment
	blt %rs, %rt, _end
	move %rd, %rt
#comment (not indented - before label)
_end:
	li $v0, 1    # local label - code indented normally
# comment
.end_macro

# ----------------------------------------------------------------------------
# DATA SECTION
# ----------------------------------------------------------------------------
# Variable declarations are indented with 1 tab
# Colons stay attached to labels, data is aligned after longest label name

.data
	message:          .asciiz "Factorial: ;; "
	LabelVeryLong:    .word 5
	LabelShort:       .word 10
	AnotherLabel:     .asciiz "This is a string #;.,\"f"
	Ascii:            .ascii "Unterminated string"
	Message:          .halfword 'A'
	LabelMed:         .word 20
	
	# Standalone directives (.eqv, .include, etc.) are indented with 1 tab
	.eqv DISPLAY_MODE_FB_ENABLE 1
	.eqv DISPLAY_MODE_TM_ENABLE 2
	
	# Standalone data directives get single indent
	.double 0.1, 0.2, 0.3 # test
	
	# Multi-line data declarations: label-only line starts double-indent block
	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
# Comment ends multi-line block (not indented - before next item)
	.double 0.1, 0.1, 0.1
	
	# Another multi-line example
	MultiLine2:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
# Comments or directives end the multi-line block
	.eqv DISPLAY_MODE_MS_SHIFT 16
	.double 0.1, 0.0, 0.2
	.eqv DISPLAY_MODE_ENHANCED 0x100

# Comment outside data declarations (not indented)
	Buffer:           .space 100
	SomeLabel:        .word 1, 2, 3, 4 # inline comment

	# Multi-line ASCII data with string literals (double-indented)
	map_data:         .ascii
		"######          "
		"#    #          "
		"#..........     "
		"#..........     "
		"#    #   ..     "
		"######   ..     "
		"         ..     "
		"         ..     "
		"         ..     "
		"         ..   .."
		"         ..  .~~"
		"         ....~~~"
		"        .~~~~~~~"
		"       .~~~~~~~~"
		"       .~~~~~~~~"
		"       .~~~~~~~~"
	
	# Include statement (indented)
	.include "file"

	# Data directive on separate line from values
	nes_font_xlate:
		.byte
		187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202
		203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218
		219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234
		235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250
		251 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234
		235 236 237 238 239 240 241 242 243 244 245 252 253 254 255

	# Multi-line with directive on separate line
	multilinetesting:
		.double 0.1, 0.1, 0.2
# Comment ends block
	.double 0.1, 0.0, 0.1

	testin420385ru9t:
		.double
		0.1, 0.2, 0.3

	# Standalone directive after multi-line data
	.byte 123 593 944

# ----------------------------------------------------------------------------
# TEXT SECTION
# ----------------------------------------------------------------------------
# Code section - functions and their contents

.text
	# Directives in .text section are indented
	.extern main
	.globl main
	.section .text
# Comment before directive (not indented)
	.global __start # inline comment
# Multiple comments before function
# stay unindented

#comment directly before function (not indented)
main:
	# Comments inside functions are indented
	li $v0, 4
	la $a0, message
	syscall

	# Calculate factorial
	li $a0, 5
	jal factorial

	# Inline comments are aligned 1 space after longest code line
	move $a0, $v0      #test
	li $v0, 1          # operators like -1 +1 /2 *2 are preserved
	syscall

	# Exit
	li $v0, 10
	syscall            # aligned comment
# Comment after function (not indented - before next function)

#comment above function (not indented)
factorial:
	# Comments describing code blocks
	beq $a0, $zero, base_case
	# Recursive case
	sub $a0, $a0, 1              # inline comments aligned
	jal factorial                # within each function
	add $a0, $a0, 1              # based on longest line
	mul $v0, $v0, $a0            # in that function
	jr $ra                       # Return

base_case:
	li $v0, 1    # 0! is 1
	jr $ra       # Return

# ----------------------------------------------------------------------------
# DO NOT FORMAT REGIONS
# ----------------------------------------------------------------------------
# Use special markers to preserve custom formatting for specific sections
# Everything between START and END is output exactly as written

# DO NOT FORMAT START
	li s0, 0
	_loop:
		la  a0, block_palettes
		mul t0, s0, BLOCK_PALETTE_SIZE
		jal display_load_palette
	add s0, s0, 1
	blt s0, N_BLOCK_PALETTES, _loop
pop s0
pop ra
jr ra
# DO NOT FORMAT END

# Without the markers, this code would be auto-formatted:
li s0, 0
_loop:
	la a0, block_palettes
	mul t0, s0, BLOCK_PALETTE_SIZE
	jal display_load_palette
	add s0, s0, 1
	blt s0, N_BLOCK_PALETTES, _loop
	pop s0
	pop ra
	jr ra

# ----------------------------------------------------------------------------
# PRESERVE INDENT COMMENTS (#!)
# ----------------------------------------------------------------------------
# Comments starting with #! preserve their original indentation
# Useful for custom formatting without wrapping entire sections

main_loop:
#! This comment stays at column 0 even though it's in a function
	addi $s0, $s0, 1             # increment number
	move $a0, $s0                # load number into $a0
	jal test_prime
	beq $v0, $zero, main_loop    # if $v0 is 0, go to main_loop

	sw $s0, 0($s1)               # store $v0 in memory
	addi $s1, $s1, 4             # increment address
	bne $s1, $s2, main_loop      # if not at end continue looping

	li $v0, 10                   # exit
	syscall

test_prime:
	subi $sp, $sp, 8
	sw $s0, 0($sp)
	sw $s1, 4($sp)
	move $s0, $zero
	li $t0, 2               # check if less $a0 than 1
	blt $a0, $t0, return    # if less than 2, return false
	li $s0, 2               # start division at 2

prime_loop:
	beq $a0, $s0, return      # if divisible by self => prime
	div $a0, $s0
	mfhi $s1                  # get remainder
	beq $s1, $zero, return    # break out of loop if not prime

	addi $s0, $s0, 1          # increment divisor
	j prime_loop              # loop again

return:
	slt $v0, $s0, $a0     # check if $s0 is less than $a0
	xori $v0, $v0, 0x1    # if so, return true
	lw $s0, 0($sp)
	lw $s1, 4($sp)
	addi $sp, $sp, 8
	jr $ra                # return

# ----------------------------------------------------------------------------
# KEY FORMATTING RULES SUMMARY
# ----------------------------------------------------------------------------
# 1. Strings are never modified (content inside quotes preserved)
# 2. Comments starting with # are preserved (# inside strings ignored)
# 3. .data and .text section headers are not indented
# 4. Data declarations get 1 tab, multi-line continuations get 2 tabs
# 5. Functions (labels with :) are not indented
# 6. Code inside functions gets 1 tab
# 7. Inline comments align 1 space after longest code line in function
# 8. Comments before labels/directives are not indented
# 9. Macros are formatted as normal code (no extra indent)
# 10. Use # DO NOT FORMAT START/END for custom formatting regions
# 11. Use #! for individual comments to preserve indentation
# ----------------------------------------------------------------------------