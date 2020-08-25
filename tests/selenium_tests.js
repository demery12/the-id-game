const { Builder, By, Key, until } = require('selenium-webdriver');

(async function example() {
    let driver1 = await new Builder().forBrowser('chrome').build();
    let driver2 = await new Builder().forBrowser('chrome').build();
    try {
        // Create Profile 1
        await driver1.get('http://localhost:2000/');
        await driver1.findElement(By.id('first-name')).sendKeys('Dylan');
        await driver1.findElement(By.id('last-name')).sendKeys('Emery');
        await driver1.findElement(By.id('display-name')).sendKeys('Picklez');
        await driver1.findElement(By.id('update-profile')).click();
        await driver1.findElement(By.id('create-room')).click();
        const roomId = await (await driver1.findElement(By.id('room-id'))).getText();
        console.log(roomId);
        await driver2.get('http://localhost:2000/');
        await driver2.findElement(By.id('first-name')).sendKeys('Sarah');
        await driver2.findElement(By.id('last-name')).sendKeys('Zachs-Adam');
        await driver2.findElement(By.id('display-name')).sendKeys('SZA');
        await driver2.findElement(By.id('update-profile')).click();
        await driver2.findElement(By.id('join-room')).sendKeys(roomId);
        await driver2.findElement(By.css('.join-room>button')).click();

    } finally {
        //await driver1.quit();
    }
})();