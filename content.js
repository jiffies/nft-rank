console.log('内容脚本已注入');

let rarityMap;

async function loadNumbersMap (filePath) {
    const numbersMap = new Map();

    try {
        const response = await fetch(chrome.runtime.getURL(filePath));
        const text = await response.text();
        const lines = text.split('\n'); // 根据换行符分割文本为行

        for (const line of lines) {
            if (line.trim()) { // 忽略空行
                const [key, value] = line.split(',').map(num => num.trim()); // 分割每一行，并去除空白字符
                numbersMap.set(key, value); // 将键和值添加到Map中
            }
        }
    } catch (error) {
        console.error('Error fetching or processing the file:', error);
    }

    return numbersMap;
}

function extractAndUpdateNumbers () {
    const anchors = document.querySelectorAll('table tr a[title]');
    anchors.forEach(anchor => {
        const titleMatch = anchor.title.match(/Inscription #\d+ NodeMonke #(\d+)/);
        if (titleMatch) {
            const nodeMonkeNumber = titleMatch[1];
            const rarity = rarityMap.get(nodeMonkeNumber);
            const firstSpan = anchor.querySelector('span');
            if (firstSpan && !firstSpan.textContent.includes('Rank')) {
                firstSpan.textContent += ` Rank ${rarity}`;
            }
        }
    });
}

(async function () {
    rarityMap = await loadNumbersMap('nodemonkes.txt')

    // 创建一个新的MutationObserver实例来监听DOM变化
    const observer = new MutationObserver(function (mutations) {
        extractAndUpdateNumbers();
    });

    const intervalId = setInterval(function () {
        extractAndUpdateNumbers()
    }, 600);

    // 配置observer将要观察的DOM变化类型
    const config = { childList: true, subtree: true };

    const target = document.querySelector('body');

    // 对目标节点应用观察者并开始观察
    if (target) {
        observer.observe(target, config);
    } else {
        console.error('目标元素不存在！');
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractAndUpdateNumbers') {
            extractAndUpdateNumbers();
        }
    });
})();
