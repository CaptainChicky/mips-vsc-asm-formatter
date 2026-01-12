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

#comment directly before function (not indented)
main:
	# Comments inside functions are indented
	li $v0, 4
	la $a0, message
	syscall

	li $a0, 5
	jal factorial

	# Inline comments are aligned 1 space after longest code line
	move $a0, $v0      # test
	li $v0, 1          # operators like 1-1 1+1 1/2 1*2 are preserved
	syscall

	li $v0, 10
	syscall            # aligned comment
# Comment after function (not indented because before next function)

# Comment above function (not indented because right above function)
factorial:
	beq $a0, $zero, base_case
	sub $a0, $a0, 1              # inline comments aligned
	jal factorial                # within each function
	add $a0, $a0, 1              # based on longest line
	mul $v0, $v0, $a0            # in that function
	jr $ra                       # Return

#! ----------------------------------------------------------------------------
#! DO NOT FORMAT REGIONS
#! ----------------------------------------------------------------------------
#! Use special markers to preserve custom formatting for specific sections
#! Everything between START and END is output exactly as written

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
