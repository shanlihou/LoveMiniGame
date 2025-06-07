

export function setStorage(key: string, value: any) {
    if (wx !== undefined) {
        wx.setStorageSync(key, value);
    } else {
        localStorage.setItem(key, value);
    }
}

export function getStorage(key: string) {
    if (wx !== undefined) {
        return wx.getStorageSync(key);
    } else {
        return localStorage.getItem(key);
    }
}

export function removeStorage(key: string) {
    if (wx !== undefined) {
        wx.removeStorageSync(key);
    } else {
        localStorage.removeItem(key);
    }
}