.macro lstr %rd, %str
#comment
.data #comment
	lstr_message: .asciiz %str #commnent
# comment
.text
	# comment
	la %rd, lstr_message
	li $v0, 1 # 0! is 1
#comment
base_case:
	#comment
	li $v0, 1    # 0! is 1
	jr $ra       # Return
.end_macro

# set rd to the minimum of register rs and register rt.
.macro min %rd, %rs, %rt
	#comment
	move %rd, %rs # comment
	blt %rs, %rt, _end
	move %rd, %rt
#comment
_end:
	li $v0, 1    # 0! is 1
# comment
.end_macro

.data
	message:          .asciiz "Factorial: ;; "
	LabelVeryLong:    .word 5
	LabelShort:       .word 10
	AnotherLabel:     .asciiz "This is a string #;.,\"f"
	Ascii:            .ascii "Unterminated string"
	Message:          .halfword 'A'
	LabelMed:         .word 20
	.eqv DISPLAY_MODE_FB_ENABLE 1
	.eqv DISPLAY_MODE_TM_ENABLE 2
	.double 0.1, 0.2, 0.3 # test
	MultiLine:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
# test
	.double 0.1, 0.1, 0.1
	MultiLine2:
		.double 0.1, 0.2, 0.3
		.double 0.4, 0.5, 0.6
		.double 0.7, 0.8, 0.9
# comments here
	.eqv DISPLAY_MODE_MS_SHIFT 16
	.double 0.1, 0.0, 0.2
	.eqv DISPLAY_MODE_ENHANCED 0x100

# comments on here
	Buffer:           .space 100
	SomeLabel:        .word 1, 2, 3, 4 # Comment after data

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
	.include "file"


# index with (ascii - 32) *using lbu*, get tile number based at NES_FONT_TILE_START
	nes_font_xlate:
		.byte
		187 188 189 190 191 192 193 194 195 196 197 198 199 200 201 202
		203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218
		219 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234
		235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250
		251 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234
		235 236 237 238 239 240 241 242 243 244 245 252 253 254 255

	multilinetesting:
		.double 0.1, 0.1, 0.2
# test
	.double 0.1, 0.0, 0.1

	testin420385ru9t:
		.double
		0.1, 0.2, 0.3

	.byte 123 593 944

# test
.text
	.extern main
	.globl main
	.section .text
# test
	.global __start # test
# test
# test

#test
main:
	# Print the message
	li $v0, 4
	la $a0, message
	syscall

	# Calculate factorial of 5 (change this to calculate another number)
	li $a0, 5
	jal factorial

	# Print the result
	move $a0, $v0      #test
	li $v0, 1          # test -1 +1 /2 *2
	syscall

	# Exit
	li $v0, 10
	syscall            # test
# test

#comment above function
factorial:
	# Base case: n = 0
	beq $a0, $zero, base_case
	# Recursive case: n! = n * (n-1)!
	sub $a0, $a0, 1              # n-1
	jal factorial                # Call factorial(n-1)
	add $a0, $a0, 1              # Restore n value
	mul $v0, $v0, $a0            # Multiply result by n
	jr $ra                       # Return

base_case:
	li $v0, 1    # 0! is 1
	jr $ra       # Return

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
# do not format
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
# do not format
# do not format

# do not format
main_loop:
	addi $s0, $s0, 1             # increment number
	move $a0, $s0                # load number into $a0
	jal test_prime
	beq $v0, $zero, main_loop    # if $v0 is 0, go to main_loop

	sw $s0, 0($s1)               # store $v0 in memory
	addi $s1, $s1, 4             # increment address
	bne $s1, $s2, main_loop      # if not at end continue looping, go to main_loop

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
	jr $ra                # return false
