// 奖励池充值脚本
// 用法: node scripts/fund-reward-pool.js <amount>

const { ethers } = require('ethers');
require('dotenv').config();

// ABI 定义
const COURSE_REGISTRY_ABI = [
    "function fundRewardPool(uint256 amount)",
    "function withdrawFromRewardPool(uint256 amount)", 
    "function getRewardPool() view returns (uint256)",
    "function COMPLETION_REWARD() view returns (uint256)",
    "function owner() view returns (address)",
    "event RewardPoolFunded(address indexed funder, uint256 amount)"
];

const OWC_TOKEN_ABI = [
    "function approve(address spender, uint256 amount)",
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

async function fundRewardPool(amount) {
    try {
        console.log('🚀 开始充值奖励池...\n');

        // 检查环境变量
        const requiredEnvs = ['PRIVATE_KEY', 'RPC_URL', 'COURSE_REGISTRY_ADDRESS', 'OWC_TOKEN_ADDRESS'];
        for (const env of requiredEnvs) {
            if (!process.env[env]) {
                throw new Error(`缺少环境变量: ${env}`);
            }
        }

        // 初始化连接
        console.log('📡 连接到区块链网络...');
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log(`📍 使用账户: ${wallet.address}\n`);

        // 连接合约
        const courseRegistry = new ethers.Contract(
            process.env.COURSE_REGISTRY_ADDRESS, 
            COURSE_REGISTRY_ABI, 
            wallet
        );
        
        const owcToken = new ethers.Contract(
            process.env.OWC_TOKEN_ADDRESS,
            OWC_TOKEN_ABI,
            wallet
        );

        // 检查是否是合约owner
        console.log('🔐 检查权限...');
        const owner = await courseRegistry.owner();
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`权限不足: 当前账户不是合约owner。Owner: ${owner}`);
        }
        console.log('✅ 权限验证通过\n');

        // 获取代币精度
        const decimals = await owcToken.decimals();
        const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);
        
        // 检查余额
        console.log('💰 检查账户余额...');
        const balance = await owcToken.balanceOf(wallet.address);
        console.log(`账户 OWC 余额: ${ethers.utils.formatUnits(balance, decimals)} OWC`);
        
        if (balance.lt(amountBN)) {
            throw new Error(`余额不足: 需要 ${amount} OWC，但只有 ${ethers.utils.formatUnits(balance, decimals)} OWC`);
        }

        // 检查当前奖励池状态
        console.log('📊 当前奖励池状态...');
        const currentPool = await courseRegistry.getRewardPool();
        const rewardAmount = await courseRegistry.COMPLETION_REWARD();
        const currentTimes = Math.floor(currentPool / rewardAmount);
        console.log(`当前奖励池: ${ethers.utils.formatUnits(currentPool, decimals)} OWC`);
        console.log(`可发放次数: ${currentTimes} 次\n`);

        // 检查授权
        console.log('🔍 检查代币授权...');
        const allowance = await owcToken.allowance(wallet.address, process.env.COURSE_REGISTRY_ADDRESS);
        
        if (allowance.lt(amountBN)) {
            console.log('📝 需要授权代币...');
            const approveTx = await owcToken.approve(process.env.COURSE_REGISTRY_ADDRESS, amountBN);
            console.log(`授权交易Hash: ${approveTx.hash}`);
            
            console.log('⏳ 等待授权确认...');
            await approveTx.wait();
            console.log('✅ 授权成功\n');
        } else {
            console.log('✅ 授权额度充足\n');
        }

        // 充值奖励池
        console.log(`💸 开始充值 ${amount} OWC 到奖励池...`);
        const fundTx = await courseRegistry.fundRewardPool(amountBN);
        console.log(`充值交易Hash: ${fundTx.hash}`);
        
        console.log('⏳ 等待交易确认...');
        const receipt = await fundTx.wait();
        
        // 解析事件
        const event = receipt.events?.find(e => e.event === 'RewardPoolFunded');
        if (event) {
            console.log(`✅ 充值成功！事件参数:`);
            console.log(`   - 充值者: ${event.args.funder}`);
            console.log(`   - 金额: ${ethers.utils.formatUnits(event.args.amount, decimals)} OWC`);
        }

        // 显示更新后的状态
        console.log('\n📊 更新后的奖励池状态:');
        const newPool = await courseRegistry.getRewardPool();
        const newTimes = Math.floor(newPool / rewardAmount);
        console.log(`新的奖励池: ${ethers.utils.formatUnits(newPool, decimals)} OWC`);
        console.log(`可发放次数: ${newTimes} 次`);
        console.log(`增加发放次数: ${newTimes - currentTimes} 次\n`);

        console.log('🎉 奖励池充值完成！');
        
    } catch (error) {
        console.error('❌ 充值失败:', error.message);
        if (error.reason) {
            console.error('原因:', error.reason);
        }
        process.exit(1);
    }
}

async function withdrawRewardPool(amount) {
    try {
        console.log('💸 开始从奖励池提取代币...\n');

        // 环境变量检查和初始化... (类似充值流程)
        const requiredEnvs = ['PRIVATE_KEY', 'RPC_URL', 'COURSE_REGISTRY_ADDRESS', 'OWC_TOKEN_ADDRESS'];
        for (const env of requiredEnvs) {
            if (!process.env[env]) {
                throw new Error(`缺少环境变量: ${env}`);
            }
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        const courseRegistry = new ethers.Contract(
            process.env.COURSE_REGISTRY_ADDRESS, 
            COURSE_REGISTRY_ABI, 
            wallet
        );

        const owcToken = new ethers.Contract(
            process.env.OWC_TOKEN_ADDRESS,
            OWC_TOKEN_ABI,
            wallet
        );

        // 权限检查
        const owner = await courseRegistry.owner();
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error(`权限不足: 当前账户不是合约owner`);
        }

        const decimals = await owcToken.decimals();
        const amountBN = ethers.utils.parseUnits(amount.toString(), decimals);

        // 检查奖励池余额
        const currentPool = await courseRegistry.getRewardPool();
        if (currentPool.lt(amountBN)) {
            throw new Error(`奖励池余额不足: 需要 ${amount} OWC，但只有 ${ethers.utils.formatUnits(currentPool, decimals)} OWC`);
        }

        console.log(`💰 从奖励池提取 ${amount} OWC...`);
        const withdrawTx = await courseRegistry.withdrawFromRewardPool(amountBN);
        console.log(`提取交易Hash: ${withdrawTx.hash}`);
        
        await withdrawTx.wait();
        console.log('✅ 提取成功！');
        
    } catch (error) {
        console.error('❌ 提取失败:', error.message);
        process.exit(1);
    }
}

async function checkRewardPoolStatus() {
    try {
        console.log('📊 检查奖励池状态...\n');

        const requiredEnvs = ['RPC_URL', 'COURSE_REGISTRY_ADDRESS', 'OWC_TOKEN_ADDRESS'];
        for (const env of requiredEnvs) {
            if (!process.env[env]) {
                throw new Error(`缺少环境变量: ${env}`);
            }
        }

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        
        const courseRegistry = new ethers.Contract(
            process.env.COURSE_REGISTRY_ADDRESS, 
            COURSE_REGISTRY_ABI, 
            provider
        );

        const owcToken = new ethers.Contract(
            process.env.OWC_TOKEN_ADDRESS,
            OWC_TOKEN_ABI,
            provider
        );

        const decimals = await owcToken.decimals();
        const currentPool = await courseRegistry.getRewardPool();
        const rewardAmount = await courseRegistry.COMPLETION_REWARD();
        const owner = await courseRegistry.owner();
        const rewardTimes = Math.floor(currentPool / rewardAmount);

        console.log('🏦 奖励池信息:');
        console.log(`合约地址: ${process.env.COURSE_REGISTRY_ADDRESS}`);
        console.log(`合约Owner: ${owner}`);
        console.log(`奖励池余额: ${ethers.utils.formatUnits(currentPool, decimals)} OWC`);
        console.log(`单次奖励: ${ethers.utils.formatUnits(rewardAmount, decimals)} OWC`);
        console.log(`可发放次数: ${rewardTimes} 次`);

        if (rewardTimes < 10) {
            console.log('\n⚠️  警告: 奖励池余额较低，建议及时充值！');
        }

    } catch (error) {
        console.error('❌ 检查失败:', error.message);
        process.exit(1);
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const amount = args[1];

    switch (command) {
        case 'fund':
            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                console.error('❌ 请提供有效的充值金额');
                console.log('用法: node scripts/fund-reward-pool.js fund <金额>');
                console.log('例如: node scripts/fund-reward-pool.js fund 1000');
                process.exit(1);
            }
            await fundRewardPool(parseFloat(amount));
            break;

        case 'withdraw':
            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                console.error('❌ 请提供有效的提取金额');
                console.log('用法: node scripts/fund-reward-pool.js withdraw <金额>');
                process.exit(1);
            }
            await withdrawRewardPool(parseFloat(amount));
            break;

        case 'status':
            await checkRewardPoolStatus();
            break;

        default:
            console.log('🎯 奖励池管理脚本');
            console.log('\n用法:');
            console.log('  node scripts/fund-reward-pool.js fund <金额>     - 充值奖励池');
            console.log('  node scripts/fund-reward-pool.js withdraw <金额> - 提取奖励池');
            console.log('  node scripts/fund-reward-pool.js status         - 查看状态');
            console.log('\n例如:');
            console.log('  node scripts/fund-reward-pool.js fund 1000');
            console.log('  node scripts/fund-reward-pool.js withdraw 500');
            console.log('  node scripts/fund-reward-pool.js status');
            process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    fundRewardPool,
    withdrawRewardPool,
    checkRewardPoolStatus
};