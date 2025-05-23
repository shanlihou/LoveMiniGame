import pandas as pd
import os
from common.const import INTENT


class SingleParser(object):
    def __init__(self, excel_path: str):
        self.excel_path = excel_path
        self.df = pd.read_excel(excel_path, header=0, skiprows=[1, 2, 3, 4, 5])
        self.dtype_row = pd.read_excel(excel_path, header=None, skiprows=2, nrows=1).iloc[0]

    @property
    def class_name(self):
        excel_name = os.path.basename(self.excel_path)
        # 首字母大写
        return excel_name.split('.')[0].capitalize()

    def parse(self):
        for index, row in self.df.iterrows():
            row_data = row.to_dict()

    def export(self, output_dir: str):
        output_list = [
            f'export class {self.class_name} {{',
            ]

        header_name_list = self.df.columns.tolist()

        for index, _type in enumerate(self.dtype_row):
            _name = header_name_list[index]
            output_list.append(f'    {_name}: {self.map_excel_type_to_ts(_type)}')

        output_list.append('}')

        output_list.append(f'export const datas: {self.class_name}[] = [')
        for index, row in self.df.iterrows():
            row_data = row.to_dict()

            output_list.append(f'{INTENT}{{')
            for _name, _type in zip(header_name_list, self.dtype_row):
                output_list.append(f'{INTENT * 2}{_name}: {self.format_value(row_data[_name], _type)},')
            output_list.append(f'{INTENT}}},')

        output_list.append(']')

        out_str = '\n'.join(output_list)

        with open(os.path.join(output_dir, f'{self.class_name}.ts'), 'w', encoding='utf-8') as f:
            f.write(out_str)

    def map_excel_type_to_ts(self, excel_type: str) -> str:
        """将Excel中的类型映射到TypeScript类型"""
        type_mapping = {
            "string": "string",
            "int": "number",
            "boolean": "boolean",
            "array": "any[]",
            # 可以根据需要添加更多类型映射
        }
        return type_mapping.get(excel_type.lower(), "any")

    def format_value(self, value, type_info: str):
        """格式化值以符合TypeScript语法"""
        if pd.isna(value):
            return "null"

        type_info = str(type_info).lower()
        if type_info == "string":
            return f'"{value}"'

        if type_info == "array":
            # 假设数组元素用逗号分隔
            return f"[{value}]" if value else "[]"
        else:
            return str(value)



