import axios from 'axios';
import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

// 定义请求体和响应体的类型
interface TranslateRequest {
    text: string;
    from?: string;
    to?: string;
}

interface TranslateResponse {
    success: boolean;
    translatedText?: string;
    error?: string;
}

const APP_ID: string = process.env.BAIDU_TRANSLATE_APPID as string; // 你的百度翻译 APPID
const SECRET_KEY: string = process.env.BAIDU_TRANSLATE_SECRET as string; // 你的百度翻译 密钥

// 翻译函数
async function translate(query: string, from = 'zh', to = 'en'): Promise<string> {
    const salt = Date.now().toString();
    const sign = crypto.createHash('md5').update(APP_ID + query + salt + SECRET_KEY).digest('hex');
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate`;

    try {
        const response = await axios.get(url, {
            params: {
                q: query,
                from: from,
                to: to,
                appid: APP_ID,
                salt: salt,
                sign: sign,
            }
        });
        return response.data.trans_result[0].dst;
    } catch (error) {
        console.error('翻译失败:', error);
        throw error;
    }
}

// API 路由处理函数
export default async function handler(req: NextApiRequest, res: NextApiResponse<TranslateResponse>) {
    if (req.method === 'POST') {
        const { text, from = 'zh', to = 'en' } = req.body as TranslateRequest;
        try {
            const translatedText = await translate(text, from, to);
            res.status(200).json({ success: true, translatedText });
        } catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
