/**
 * 将 Uint8Array 转换为 Base64 字符串
 * @param uint8Array - 输入的二进制数据
 * @returns Base64 编码结果
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
    // Base64 字符表
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
  
    for (let i = 0; i < uint8Array.length; i += 3) {
      // 每次处理 3 个字节（24 bits）
      const byte1 = uint8Array[i];
      const byte2 = uint8Array[i + 1];
      const byte3 = uint8Array[i + 2];
  
      // 将 3 个字节拆分为 4 个 6-bit 数字
      const enc1 = byte1 >> 2;
      const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      const enc4 = byte3 & 63;
  
      // 处理末尾不足 3 字节的情况（补 =）
      const triplet = (
        CHARS.charAt(enc1) +
        CHARS.charAt(enc2) +
        (byte2 === undefined ? '=' : CHARS.charAt(enc3)) +
        (byte3 === undefined ? '=' : CHARS.charAt(enc4))
      );
  
      output += triplet;
    }
  
    return output;
  }

  export function isWx() {
    return typeof wx !== 'undefined';
  }

  export function randomWeighted(weights: number[]) {
    const total = weights.reduce((a, b) => a + b, 0);
    const random = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) return i;
    }
  }