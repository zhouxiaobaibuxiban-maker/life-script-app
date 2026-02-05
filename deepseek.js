/**
 * DeepSeek AI 分析模块
 * 需要配置 API_KEY 环境变量或 .env 文件
 */

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 调用 DeepSeek API 分析用户的四象限时间数据
 * @param {Object} data - 包含 quadrants 和 review 的数据
 * @returns {Promise<string>} - AI 分析结果
 */
async function analyzeWithDeepSeek(data) {
  if (!API_KEY) {
    return '❌ DeepSeek API 密钥未配置。请检查 .env 文件中是否设置了 DEEPSEEK_API_KEY。';
  }

  try {
    // 构建分析提示词
    const prompt = buildPrompt(data);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的时间管理教练和人生脚本设计师。你深刻理解"人生剧本"理念：每个人都是自己人生的导演。基于用户真实的时间数据，提供深度的、个性化的洞察和建议。语气要温暖、鼓励、但也要直言不讳。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('DeepSeek API error:', error);
      return `⚠️ API 错误: ${error.error?.message || '未知错误'}`;
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || '无法获取分析结果';
  } catch (error) {
    console.error('DeepSeek request error:', error);
    return `❌ 分析失败: ${error.message}`;
  }
}

function buildPrompt(data) {
  const { appConfig, weekData } = data;
  const { tasks } = weekData;
  const categories = appConfig?.categories || [];
  
  // 统计各类别完成情况
  const stats = {};
  categories.forEach(cat => {
    stats[cat.name] = { total: 0, done: 0, fail: 0, emoji: cat.emoji };
  });

  Object.values(tasks).forEach(task => {
    if (stats[task.category]) {
      stats[task.category].total++;
      if (task.status === 'done') stats[task.category].done++;
      if (task.status === 'fail') stats[task.category].fail++;
    }
  });

  let prompt = `【用户的人生脚本数据】\n\n`;
  
  prompt += `【用户定义的时间分类】\n`;
  categories.slice(0, 4).forEach(cat => {
    prompt += `${cat.emoji} ${cat.name}\n`;
  });
  
  prompt += `\n【本周执行统计】\n`;
  let totalHours = 0;
  Object.entries(stats).forEach(([name, s]) => {
    if (s.total > 0) {
      const rate = ((s.done / s.total) * 100).toFixed(0);
      prompt += `${s.emoji} ${name}：${s.done}/${s.total} 完成（${rate}%）\n`;
      totalHours += s.total;
    }
  });

  prompt += `\n【时间占比分析】\n`;
  Object.entries(stats).forEach(([name, s]) => {
    if (s.total > 0) {
      const percent = ((s.total / totalHours) * 100).toFixed(0);
      prompt += `${s.emoji} ${name}：${percent}% (${s.total}小时)\n`;
    }
  });

  prompt += `\n【本周复盘】\n`;
  if (weekData.review?.good) prompt += `✅ 做得好的地方：${weekData.review.good}\n`;
  if (weekData.review?.bad) prompt += `❌ 需要改进的地方：${weekData.review.bad}\n`;
  if (weekData.review?.next) prompt += `💡 下周计划：${weekData.review.next}\n`;

  prompt += `\n【分析要求】\n`;
  prompt += `1. 从"人生剧本"的理念出发（每个人都是自己人生的导演），评估用户本周的时间分配是否符合其价值观\n`;
  prompt += `2. 指出执行率最低和最高的类别，分析原因\n`;
  prompt += `3. 知行合一分析：计划vs实际执行情况，是否存在"计划美好、执行落差"的问题\n`;
  prompt += `4. 给出3-5条针对性的下周改进建议，强调"保持80%的固定动作，灵活调整20%"的原则\n`;
  prompt += `5. 用温暖、鼓励但直言的语气，帮助用户认识到自己的模式和潜力\n`;

  return prompt;
}

module.exports = { analyzeWithDeepSeek };
