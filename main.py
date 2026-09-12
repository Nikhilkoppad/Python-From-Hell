import sys
import logging
import time
from typing import Optional, Union
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_arguments(args: list) -> Optional[str]:
    if len(args) == 3 and args[1] == 'main.py':
        return args[2]
    elif len(args) == 2 and args[0] == 'main.py':
        return args[1]
    logger.error("Usage: python main.py <input_file>")
    return None

def read_file(file_path: str) -> Optional[Union[str, dict]]:
    try:
        with open(file_path, 'r') as file:
            content = file.read()
            if file_path.endswith('.json'):
                return json.loads(content)
            return content
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return None
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON file: {file_path}")
        return None
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        return None

def process_data(data: str) -> str:
    start_time = time.time()
    processed_data = data.upper()
    end_time = time.time()
    elapsed_time = end_time - start_time
    logger.info(f"Data processing time: {elapsed_time:.4f} seconds")
    return processed_data

def write_output(output: str, output_file: str) -> bool:
    try:
        with open(output_file, 'w') as file:
            file.write(output)
        return True
    except Exception as e:
        logger.error(f"Error writing output: {e}")
        return False

def main():
    input_file = parse_arguments(sys.argv)
    if not input_file:
        return

    data = read_file(input_file)
    if not data:
        return

    processed_data = process_data(data)
    output_file = input_file.replace('.txt', '_output.txt')
    if write_output(processed_data, output_file):
        logger.info(f"Processed data written to {output_file}")

if __name__ == '__main__':
    main()
