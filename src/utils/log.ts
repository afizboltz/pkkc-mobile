export const printLog = (title: string, message?: string | object | boolean) => {
    if (__DEV__) {
        console.log(title, JSON.stringify(message, null, 3));
    }
}