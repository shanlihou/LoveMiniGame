import pandas as pd
import os
from classes.SingleParser import SingleParser

def convert_excel_to_ts(excel_path: str, output_dir: str):
    """
    将Excel文件转换为TypeScript文件
    
    Args:
        excel_path: Excel文件路径
        output_dir: 输出目录路径
    """
    single_parser = SingleParser(excel_path)
    single_parser.parse()
    single_parser.export(output_dir)

def map_excel_type_to_ts(excel_type: str) -> str:
    """将Excel中的类型映射到TypeScript类型"""
    type_mapping = {
        "string": "string",
        "number": "number",
        "boolean": "boolean",
        "array": "any[]",
        # 可以根据需要添加更多类型映射
    }
    return type_mapping.get(excel_type.lower(), "any")

def format_value(value, type_info: str):
    """格式化值以符合TypeScript语法"""
    if pd.isna(value):
        return "null"
    
    type_info = str(type_info).lower()
    if type_info == "string":
        return f'"{value}"'
    elif type_info == "array":
        # 假设数组元素用逗号分隔
        return f"[{value}]" if value else "[]"
    else:
        return str(value)

if __name__ == "__main__":
    # 示例用法
    excel_path = "hit.xlsx"
    output_dir = "../assets/game/scripts/data"
    convert_excel_to_ts(excel_path, output_dir)