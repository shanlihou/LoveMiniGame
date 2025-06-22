import { SAVE_HEAD_NAME } from "./constant";
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

export function takePhotoWxPrivacy(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.requirePrivacyAuthorize({
            success: (res) => {
                resolve(true);
            },
            fail: (err) => {
                resolve(false);
            }
        })
    })
}

export function takePhotoInWx(): Promise<string | null> {
    return new Promise((resolve, reject) => {
        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => { 
                resolve(res.tempFilePaths[0]);
            },
            fail: (err) => {
                resolve(null);
            }
        })
    })
}

export function saveTempFile(tempFileName: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const ext = tempFileName.split('.').pop();
        const destPath = `${wx.env.USER_DATA_PATH}/${SAVE_HEAD_NAME}.${ext}`;
        const fs = wx.getFileSystemManager();
        fs.copyFile({
            srcPath: tempFileName,
            destPath: destPath,
            success: (res) => {
                resolve(destPath);
            },
            fail: (err) => {
                resolve(null);
            }
        })
    })
}

export function openPrivacyContract() {
    if (!isWx()) {
        return;
    }

    wx.openPrivacyContract({
        success: () => {
            console.log("openPrivacyContract success");
        }, // 打开成功
        fail: () => {
            console.log("openPrivacyContract fail");
        }, // 打开失败
        complete: () => {
            console.log("openPrivacyContract complete");
        }
    })
}

export function initPrivacAuth() {
    if (!isWx()) {
        return;
    }

    wx.onNeedPrivacyAuthorization(resolve => {
        console.log("onNeedPrivacyAuthorization");
        resolve({ event: 'agree' });
    });

    wx.showShareMenu({
        menus: ['shareAppMessage', 'shareTimeline']
    })
}