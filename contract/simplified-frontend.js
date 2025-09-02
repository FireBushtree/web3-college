// 简化的前端代码 - OWC 代币现在使用 0 位小数（整数）

// 🎉 现在不需要复杂的单位转换了！
// OWC 代币的 decimals = 0，可以直接使用整数

async function purchaseCourse(courseName) {
    try {
        console.log('开始购买课程:', courseName);
        
        // 1. 获取课程价格（现在直接是整数，如 1000, 2000 等）
        const coursePrice = await courseRegistry.getCoursePrice(courseName);
        console.log('课程价格:', coursePrice.toString(), 'OWC');
        
        // 2. 检查用户余额
        const userBalance = await owcToken.balanceOf(userAddress);
        console.log('用户余额:', userBalance.toString(), 'OWC');
        
        // 3. 检查授权额度
        const allowance = await owcToken.allowance(userAddress, courseRegistryAddress);
        console.log('当前授权:', allowance.toString(), 'OWC');
        
        // 4. 如果授权不足，进行授权（直接使用整数！）
        if (allowance.lt(coursePrice)) {
            console.log('授权代币中...');
            const approveTx = await owcToken.approve(courseRegistryAddress, coursePrice);
            await approveTx.wait();
            console.log('授权成功！');
        }
        
        // 5. 购买课程
        console.log('购买课程中...');
        const purchaseTx = await courseRegistry.purchaseCourse(courseName);
        await purchaseTx.wait();
        
        console.log('🎉 课程购买成功！');
        return true;
        
    } catch (error) {
        console.error('购买失败:', error.message);
        return false;
    }
}

// 创建课程也变得简单了
async function createCourse(courseName, priceInOWC) {
    try {
        console.log('创建课程:', courseName, '价格:', priceInOWC, 'OWC');
        
        // 直接使用整数价格，无需转换！
        const createTx = await courseRegistry.createCourse(courseName, priceInOWC);
        await createTx.wait();
        
        console.log('✅ 课程创建成功！');
        return true;
        
    } catch (error) {
        console.error('创建失败:', error.message);
        return false;
    }
}

// 简单的余额查询
async function getBalance(userAddress) {
    const balance = await owcToken.balanceOf(userAddress);
    console.log('用户余额:', balance.toString(), 'OWC');
    return balance;
}

// 使用示例：
// createCourse("Solidity 基础", 100);  // 创建价格为 100 OWC 的课程
// purchaseCourse("Solidity 基础");      // 购买课程

// 对比：修改前后的区别
console.log(`
🔥 修改前（18位小数）：
- 转账 100 OWC 需要：ethers.parseUnits("100", 18) = "100000000000000000000"
- 代码复杂，容易出错

✅ 修改后（0位小数）：
- 转账 100 OWC 只需要：100
- 简单直观，不会出错！
`);

export { purchaseCourse, createCourse, getBalance };