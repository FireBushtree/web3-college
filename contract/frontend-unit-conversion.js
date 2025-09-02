// Frontend Unit Conversion Guide for OWC Token
// OWC Token has 18 decimals (standard ERC20)

// 方案1: 使用 ethers.js (推荐)
import { ethers } from 'ethers';

// 将人类可读的数量转换为 wei 单位
function parseOWCAmount(humanAmount) {
    // 例如: "100" -> "100000000000000000000"
    return ethers.parseUnits(humanAmount.toString(), 18);
}

// 将 wei 单位转换为人类可读的数量
function formatOWCAmount(weiAmount) {
    // 例如: "100000000000000000000" -> "100.0"
    return ethers.formatUnits(weiAmount, 18);
}

// 使用示例:
async function purchaseCourse(courseName, coursePriceInOWC) {
    try {
        // 1. 获取课程价格 (合约返回的是 wei 单位)
        const coursePriceWei = await courseRegistry.getCoursePrice(courseName);
        console.log('Course price (wei):', coursePriceWei.toString());
        console.log('Course price (OWC):', formatOWCAmount(coursePriceWei));
        
        // 2. 检查当前授权
        const allowance = await owcToken.allowance(userAddress, courseRegistryAddress);
        console.log('Current allowance (wei):', allowance.toString());
        console.log('Current allowance (OWC):', formatOWCAmount(allowance));
        
        // 3. 如果授权不足，进行授权
        if (allowance < coursePriceWei) {
            console.log('Approving tokens...');
            const approveTx = await owcToken.approve(courseRegistryAddress, coursePriceWei);
            await approveTx.wait();
            console.log('Approval successful');
        }
        
        // 4. 购买课程
        console.log('Purchasing course...');
        const purchaseTx = await courseRegistry.purchaseCourse(courseName);
        await purchaseTx.wait();
        console.log('Course purchased successfully!');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// 方案2: 使用 Web3.js
import Web3 from 'web3';

function parseOWCAmountWeb3(humanAmount) {
    // 例如: "100" -> "100000000000000000000"
    return Web3.utils.toWei(humanAmount.toString(), 'ether');
}

function formatOWCAmountWeb3(weiAmount) {
    // 例如: "100000000000000000000" -> "100"
    return Web3.utils.fromWei(weiAmount, 'ether');
}

// 方案3: 手动计算 (不推荐，但可以理解原理)
const DECIMALS = 18;

function parseOWCAmountManual(humanAmount) {
    return (parseFloat(humanAmount) * Math.pow(10, DECIMALS)).toString();
}

function formatOWCAmountManual(weiAmount) {
    return (parseFloat(weiAmount) / Math.pow(10, DECIMALS)).toString();
}

// 常见错误示例:
// ❌ 错误: 直接使用人类可读数量
// await owcToken.approve(courseRegistryAddress, 100); // 这只是 0.0000000000000001 OWC!

// ✅ 正确: 使用正确的单位转换
// await owcToken.approve(courseRegistryAddress, parseOWCAmount("100")); // 这是 100 OWC

// 调试工具函数:
async function debugTokenAmounts(userAddress, courseRegistryAddress, courseName) {
    console.log('=== Token Amount Debug ===');
    
    // 用户余额
    const userBalance = await owcToken.balanceOf(userAddress);
    console.log('User balance (wei):', userBalance.toString());
    console.log('User balance (OWC):', formatOWCAmount(userBalance));
    
    // 课程价格
    const coursePrice = await courseRegistry.getCoursePrice(courseName);
    console.log('Course price (wei):', coursePrice.toString());
    console.log('Course price (OWC):', formatOWCAmount(coursePrice));
    
    // 授权额度
    const allowance = await owcToken.allowance(userAddress, courseRegistryAddress);
    console.log('Allowance (wei):', allowance.toString());
    console.log('Allowance (OWC):', formatOWCAmount(allowance));
    
    console.log('========================');
}

export {
    parseOWCAmount,
    formatOWCAmount,
    parseOWCAmountWeb3,
    formatOWCAmountWeb3,
    debugTokenAmounts,
    purchaseCourse
};