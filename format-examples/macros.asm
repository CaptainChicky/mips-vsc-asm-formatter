# ----------------------------------------------------------------------------
# MACROS
# ----------------------------------------------------------------------------
# Macros are formatted as text templates with no extra indentation
# Code inside macros follows the same rules as normal code

.macro lstr %rd, %str
# comments are formatted normally in a macro as if it were actual code
.data # inline comments are not changed
	#! formatting of data the same as normal
	lstr_message: .asciiz %str
	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
	.eqv DISPLAY_MODE_FB_ENABLE 1
	.double 0.1, 0.4, 0.6 # the .eqv resets indenting
# comments outside of .text are not indented by default

.text
	# even without a label, code is indented after .text in a macro
	la %rd, lstr_message
	li $v0, 1

# comment (not indented because before label)
# code in .text is formatted the same as normal
base_case:
	# comment (indented because inside label)
	li $v0, 1    # inline comment aligned
	jr $ra       # inline comment aligned
.end_macro

# comment not indented
.macro min %rd, %rs, %rt
	# comment indented inside macro if no .data and no .text
	move %rd, %rs
	blt %rs, %rt, _end
	move %rd, %rt

# comment (not indented because before label)
_end:
	# comment (indented because inside lable)
	li $v0, 1
# comment not indented because before macro end and after last line of label code
.end_macro


# ----------------------------------------------------------------------------
# without comments
# ----------------------------------------------------------------------------

.macro lstr %rd, %str
.data
	lstr_message: .asciiz %str
	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
	.eqv DISPLAY_MODE_FB_ENABLE 1
	.double 0.1, 0.4, 0.6

.text
	la %rd, lstr_message
	li $v0, 1
base_case:
	li $v0, 1
	jr $ra
.end_macro

.macro min %rd, %rs, %rt
	move %rd, %rs
	blt %rs, %rt, _end
	move %rd, %rt
_end:
	li $v0, 1
.end_macro
