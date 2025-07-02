def get_input():
    return int(input("Enter a number: "))

def calculate_sum(x, y):
    return x + y

def main():
    num1 = get_input()
    num2 = get_input()
    result = calculate_sum(num1, num2)
    print(f"Result: {result}")

if __name__ == "__main__":
    main()
