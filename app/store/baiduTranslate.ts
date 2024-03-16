import axios from 'axios';
import crypto from 'crypto';

// 替换为你自己的百度翻译 AppID 和密钥
const appid = 'xxxx';
const secretKey = 'xxxxxl';

export const translateToEnglish = async (text: string): Promise<string> => {
  const salt = Math.random().toString().slice(-5);
  const sign = crypto.createHash('md5').update(appid + text + salt + secretKey).digest('hex');

  const params = new URLSearchParams();
  params.append('q', text);
  params.append('from', 'zh');
  params.append('to', 'en');
  params.append('appid', appid);
  params.append('salt', salt);
  params.append('sign', sign);

  try {
    const response = await axios.post('https://api.fanyi.baidu.com/api/trans/vip/translate', params);
    const translatedText = response.data.trans_result[0].dst;
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // 如果翻译失败,返回原始文本
  }
};
