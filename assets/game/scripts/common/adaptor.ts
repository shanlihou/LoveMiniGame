import { RenderTexture, Texture2D } from "cc";
import { SAVE_HEAD_NAME } from "./constant";
import { isWx } from "./utils";

// WeChat Mini Game type declarations
declare const wx: any;

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
                console.error('takePhotoWxPrivacy fail', err);
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

export function genEmojiNotWx(pixelBuff: Uint8Array, width: number, height: number) {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create ImageData and flip the image vertically
    const imageData = ctx.createImageData(width, height);
    
    // Flip the image vertically and copy pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = ((height - 1 - y) * width + x) * 4;
            
            imageData.data[targetIndex] = pixelBuff[sourceIndex];     // R
            imageData.data[targetIndex + 1] = pixelBuff[sourceIndex + 1]; // G
            imageData.data[targetIndex + 2] = pixelBuff[sourceIndex + 2]; // B
            imageData.data[targetIndex + 3] = pixelBuff[sourceIndex + 3]; // A
        }
    }
    
    ctx.putImageData(imageData, 0, 0);

    // Convert to data URL with transparency support
    const dataURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = 'captured_image.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Image saved successfully');
}

export async function genEmoji(pixelBuff: Uint8Array, width: number, height: number) {
    if (!isWx()) {
        // Use genEmojiNotWx for non-WeChat environment
        genEmojiNotWx(pixelBuff, width, height);
        return;
    }

    // Calculate the height of the cropped image based on rate
    console.log('wx create canvas')
    const canvas = wx.createCanvas();
    canvas.width = width;  // 图片宽度
    canvas.height = height; // 裁剪后的高度
    console.log('canvas');
    const ctx = canvas.getContext('2d');

    // Create ImageData for the full image first
    const fullImageData = ctx.createImageData(width, height);
    
    // Flip the image vertically and copy pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = ((height - 1 - y) * width + x) * 4;
            
            fullImageData.data[targetIndex] = pixelBuff[sourceIndex];     // R
            fullImageData.data[targetIndex + 1] = pixelBuff[sourceIndex + 1]; // G
            fullImageData.data[targetIndex + 2] = pixelBuff[sourceIndex + 2]; // B
            fullImageData.data[targetIndex + 3] = pixelBuff[sourceIndex + 3]; // A
        }
    }
    
    // Put the full flipped image to canvas
    console.log('put image')
    ctx.putImageData(fullImageData, 0, 0);
    
    // // Create a new canvas for the cropped image
    // const croppedCanvas = wx.createCanvas();
    // croppedCanvas.width = width;
    // croppedCanvas.height = height;
    // const croppedCtx = croppedCanvas.getContext('2d');
    
    // // Draw only the top portion of the image based on rate
    // croppedCtx.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);

    const tempFilePath = canvas.toTempFilePathSync({
        fileType: 'png',
        quality: 1, // 质量 0-1
        destWidth: width,
        destHeight: height
        });

    console.log('tempFilePath', tempFilePath);

    if (!await getWriteAuth()) {
        return;
    }

    if (!await saveImageToPhotosAlbum(tempFilePath)) {
        return;
    }

    wx.showToast({
        title: '图片保存成功',
        icon: 'success',
        duration: 2000
    });
}

export function getWriteAuth(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.authorize({
            scope: 'scope.writePhotosAlbum',   // 需要获取相册权限
            success: (res)=>{
                console.log('getWriteAuth success', res);
                resolve(true);
            },
            fail: (res)=>{  
                console.log('getWriteAuth fail', res);
                resolve(false);
            }
        })
    })
}

export function saveImageToPhotosAlbum(tempFilePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: (res)=>{
                console.log('saveImageToPhotosAlbum success', res);
                resolve(true);
            },
            fail: (res)=>{
                console.log('saveImageToPhotosAlbum fail', res);
                resolve(false);
            }
        })
    })  
}

export function getSetting(): Promise<any | null> {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res)=>{
                console.log('getSetting success', res);
                resolve(res);
            },
            fail: (res)=>{
                console.error('getSetting fail', res);
                resolve(null);
            }
        })
    })
}