import pandas as pd
import os
from classes.single_parser import SingleParser

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

if __name__ == "__main__":
    # 示例用法
    excel_path = "hit.xlsx"
    output_dir = "../assets/game/scripts/data"
    convert_excel_to_ts(excel_path, output_dir)