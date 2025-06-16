import { isWx } from "./utils";


export function setStorage(key: string, value: any) {
    if (isWx()) {
        wx.setStorageSync(key, value);
    } else {
        localStorage.setItem(key, value);
    }
}

export function getStorage(key: string) {
    if (isWx()) {
        return wx.getStorageSync(key);
    } else {
        return localStorage.getItem(key);
    }
}

export function getStorageNumber(key: string) {
    const value = getStorage(key);
    return value ? Number(value) : 0;
}

export function removeStorage(key: string) {
    if (isWx()) {
        wx.removeStorageSync(key);
    } else {
        localStorage.removeItem(key);
    }
}