import pytest
from unittest.mock import patch, mock_open
from main import parse_arguments, read_file, process_data, write_output, main, json

def test_parse_arguments():
    assert parse_arguments(['python', 'main.py', 'input.txt']) == 'input.txt'
    assert parse_arguments(['python', 'main.py']) is None
    assert parse_arguments(['python', 'main.py', 'input.txt', 'extra']) is None

def test_read_file():
    with patch('builtins.open', mock_open(read_data='test data')):
        assert read_file('input.txt') == 'test data'
    
    with patch('builtins.open', side_effect=FileNotFoundError):
        assert read_file('nonexistent.txt') is None
    
    with patch('builtins.open', side_effect=Exception('test error')):
        assert read_file('error.txt') is None

def test_process_data():
    assert process_data('test data') == 'TEST DATA'
    assert process_data('') == ''
    assert process_data('  leading and trailing spaces  ') == '  LEADING AND TRAILING SPACES  '

def test_write_output():
    with patch('builtins.open', mock_open()):
        assert write_output('test data', 'output.txt') is True
    
    with patch('builtins.open', side_effect=Exception('test error')):
        assert write_output('test data', 'error.txt') is False

def test_read_json_file():
    with patch('builtins.open', mock_open(read_data='{"key": "value"}')):
        assert read_file('input.json') == {'key': 'value'}

def test_read_json_file_error():
    with patch('builtins.open', side_effect=json.JSONDecodeError):
        assert read_file('input.json') is None
