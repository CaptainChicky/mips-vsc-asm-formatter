.data
	message: .asciiz "Factorial: "

.text
main:
	# Print the message
	li $v0, 4
	la $a0, message
	syscall

	# Calculate factorial of 5
	li $a0, 5
	jal factorial

	# Print the result
	move $a0, $v0
	li $v0, 1
	syscall

	# Exit program
	li $v0, 10
	syscall


factorial:
	# Create stack frame
	addi $sp, $sp, -8            # Allocate space for $ra and $a0
	sw $ra, 4($sp)               # Save return address
	sw $a0, 0($sp)               # Save argument n

	# Base case: if n == 0
	beq $a0, $zero, base_case

	# Recursive case: n! = n * (n-1)!
	addi $a0, $a0, -1            # n - 1
	jal factorial                # Call factorial(n-1)

	lw $a0, 0($sp)               # Restore original n
	mul $v0, $v0, $a0            # v0 = (n-1)! * n
	j end_factorial              # Skip base case code


base_case:
	li $v0, 1    # 0! = 1


end_factorial:
	# Restore stack frame
	lw $ra, 4($sp)      # Restore return address
	addi $sp, $sp, 8    # Deallocate stack
	jr $ra              # Return to caller
