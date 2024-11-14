import random
import string

# Generate 3 random strings, set 25 digits and 15 letters
for _ in range(3):
    letters = string.ascii_letters
    numbers = string.digits
    num_letters = 15
    num_numbers = 25
    
    random_letters = ''.join(random.choices(letters, k=num_letters))
    random_numbers = ''.join(random.choices(numbers, k=num_numbers))
    
    random_string = ''.join(random.sample(random_letters + random_numbers, 40))
    print(random_string)