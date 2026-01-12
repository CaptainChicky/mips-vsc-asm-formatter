# ----------------------------------------------------------------------------
# DATA SECTION
# ----------------------------------------------------------------------------
# Variable declarations are indented with 1 tab
# Colons stay attached to labels, data is aligned after longest label name

# standalone directives are indented with 1 tab
	.include "file1.asm"
	.include "file2.asm"

# comment outside is not indented
.data
# comment inside is still not indented by default
    #! you can override indentation
	message:        .asciiz "Factorial: ;; "
	LabelVeryLong:  .word 5
	LabelShort:     .word 10
	AnotherLabel:   .asciiz "This is a string #;.,\"f"
	Ascii:          .ascii "Unterminated string"
	Message:        .halfword 'A'
	LabelMed:       .word 20

# comment inside is still not indented by default
    #! standalone directives are indented with 1 tab (.eqv, .include etc)
	.eqv DISPLAY_MODE_FB_ENABLE 1
	.eqv DISPLAY_MODE_TM_ENABLE 2

    #! standalone data directives get single indent as well
	.double 0.1, 0.2, 0.3

    #! Multi-line data declarations, label-only line (flag:) starts double-indent block
	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9

	.double 0.3, 0.5, 0.2 # newline ends multi-line block

	MultiLine2:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
    #! Comment ends multi-line block
	.double 0.1, 0.1, 0.1

	MultiLine3:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
	.eqv DISPLAY_MODE_MS_SHIFT 16 # non data directives end the multi-line block
	.double 0.1, 0.0, 0.2

    #! Multi-line ASCII data with string literals (double-indented)
	map_data:       .ascii
		"######          "
		"         ..     "
		"       .~~~~~~~~"

    #! Data directive on separate line from values
	nes_font_xlate:
		.byte
		187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202
		203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218


# ----------------------------------------------------------------------------
# without comments
# ----------------------------------------------------------------------------

	.include "file1.asm"
	.include "file2.asm"

.data
	message:        .asciiz "Factorial: ;; "
	LabelVeryLong:  .word 5
	LabelShort:     .word 10
	AnotherLabel:   .asciiz "This is a string #;.,\"f"
	Ascii:          .ascii "Unterminated string"
	Message:        .halfword 'A'
	LabelMed:       .word 20

	.eqv DISPLAY_MODE_FB_ENABLE 1
	.eqv DISPLAY_MODE_TM_ENABLE 2

	.double 0.1, 0.2, 0.3

	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9

	.double 0.3, 0.5, 0.2

	MultiLine2:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
    #! Comment ends multi-line block
	.double 0.1, 0.1, 0.1

	MultiLine3:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
	.eqv DISPLAY_MODE_MS_SHIFT 16
	.double 0.1, 0.0, 0.2

	map_data:       .ascii
		"######          "
		"         ..     "
		"       .~~~~~~~~"

	nes_font_xlate:
		.byte
		187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202
		203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218
