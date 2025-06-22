import { RenderTexture } from "cc";
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

export function getStorageString(key: string): string {
    const value = getStorage(key);
    return value ? value : '';
}

export function getStorageNumber(key: string): number {
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

export function genEmoji(renderTex: RenderTexture, rate: number) {
    if (!isWx()) {
        return;
    }

    const pixelBuff = renderTex.readPixels();

    const canvas = wx.createCanvas();
    canvas.width = renderTex.width;  // 图片宽度
    canvas.height = renderTex.height * rate; // 图片高度
    const ctx = canvas.getContext('2d');

    // 创建 ImageData 并填充像素
    const imageData = ctx.createImageData(renderTex.width, renderTex.height);
    imageData.data.set(pixelBuff); // 填入 Uint8Array 数据
    ctx.putImageData(imageData, 0, 0);

    const tempFilePath = canvas.toTempFilePathSync({
        fileType: 'png',
        quality: 1, // 质量 0-1
        destWidth: renderTex.width,
        destHeight: renderTex.height
        });

    console.log('tempFilePath', tempFilePath);

    wx.authorize({
        scope: 'scope.writePhotosAlbum',   // 需要获取相册权限
        success: (res)=>{     
            // 将截图保存到相册中
            wx.saveImageToPhotosAlbum({
                filePath: tempFilePath,
                success: (res)=>{
                    console.log('图片保存成功', res);
                    wx.showToast({
                        title: '图片保存成功',
                        icon: 'success',
                        duration: 2000
                    });
                },
                fail: (res)=>{
                    console.log(res);
                    console.log('图片保存失败');
                }
            });
        },
        fail: (res)=>{
            console.log('授权失败');
        }
    });
}
