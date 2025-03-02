/**
 * 新聞內容解析工具
 * 用於從 Markdown 文件中解析出新聞項目
 */
export const useNews = () => {
  /**
   * 標準化標籤文本
   * @param {string} tag 原始標籤文本
   * @returns {string} 標準化後的標籤
   */
  const normalizeTag = (tag) => {
    // 移除前後空格並轉換為小寫以確保唯一性
    return tag.trim().toLowerCase();
  };

  /**
   * 解析新聞內容
   * @param {string} content Markdown 文件內容
   * @returns {Array} 解析後的新聞項目陣列
   */
  const parseNews = (content) => {
    // 分割為各個部分，以 '## ' 作為分隔符
    const sections = content.split('## ').filter(Boolean);
    if (sections.length === 0) return [];

    // 如果第一部分是標題 (# 相關報導列表)，則移除
    if (sections[0].startsWith('# ')) {
      sections.shift();
    }

    return sections.map(section => {
      const lines = section.trim().split('\n').filter(Boolean);
      const titleLine = lines[0];
      
      // 解析標題行 (日期 | 標題)
      const [datePart, titlePart] = titleLine.split(' | ');
      const date = datePart.trim();
      const title = titlePart ? titlePart.trim() : '未知標題';
      
      // 解析來源行
      const sourceLine = lines.find(line => line.startsWith('來源: '));
      const source = sourceLine 
        ? sourceLine.match(/來源: \[(.*?)\]/)?.[1] || '未知來源'
        : '未知來源';
      const sourceUrl = sourceLine
        ? sourceLine.match(/\((https?:\/\/[^)]+)\)/)?.[1] || ''
        : '';
      
      // 解析URL
      const urlLine = lines.find(line => line.startsWith('http'));
      const url = urlLine ? urlLine.trim() : '';
      
      // 解析標籤 - 改進標籤提取邏輯
      const tagsLine = lines.find(line => line.startsWith('#'));
      const tags = tagsLine 
        ? tagsLine.split(' ')
            .filter(tag => tag.startsWith('#'))
            .map(tag => normalizeTag(tag.substring(1)))
            .filter(tag => tag.length > 0) // 過濾空標籤
        : [];
      
      // 移除重複標籤
      const uniqueTags = [...new Set(tags)];
      
      // 解析摘要
      const summaryLines = lines.filter(line => line.startsWith('> '));
      const summary = summaryLines
        .map(line => line.substring(2))
        .join(' ')
        .trim();

      return {
        title,
        date,
        source,
        sourceUrl,
        url,
        tags: uniqueTags,
        summary
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期降序排序
  };

  /**
   * 根據標籤過濾新聞
   * @param {Array} news 新聞項目數組
   * @param {string} tag 標籤
   * @returns {Array} 過濾後的新聞項目
   */
  const filterNewsByTag = (news, tag) => {
    if (!tag) return news;
    const normalizedTag = normalizeTag(tag);
    return news.filter(item => 
      item.tags.some(itemTag => normalizeTag(itemTag) === normalizedTag)
    );
  };

  /**
   * 獲取所有可用的標籤
   * @param {Array} news 新聞項目數組
   * @returns {Array} 所有標籤的數組
   */
  const getAllTags = (news) => {
    // 使用 Map 暫存標籤，確保標準化後的標籤不重複
    const tagsMap = new Map();
    
    news.forEach(item => {
      item.tags.forEach(tag => {
        const normalizedTag = normalizeTag(tag);
        // 只保存該標籤的第一個出現形式
        if (!tagsMap.has(normalizedTag)) {
          tagsMap.set(normalizedTag, tag);
        }
      });
    });
    
    // 返回所有不重複的標籤
    return Array.from(tagsMap.values()).sort();
  };

  return {
    parseNews,
    filterNewsByTag,
    getAllTags
  };
}; 