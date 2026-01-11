/**
 * QR Code Tool - Vercel Serverless Function
 * 提供 RESTful API 与 Supabase 数据库交互
 */

const { createClient } = require('@supabase/supabase-js');

// ============ Supabase 初始化 ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

function getSupabase() {
    if (!supabase && supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
}

// ============ 主处理函数 ============
module.exports = async (req, res) => {
    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const supabaseClient = getSupabase();

    if (!supabaseClient) {
        return res.status(500).json({
            success: false,
            error: '服务器未配置 Supabase，请检查环境变量'
        });
    }

    const { method, url } = req;

    // 解析路径：/api/history 或 /api/history/xxx
    const pathParts = url.replace('/api', '').split('/').filter(Boolean);
    const resource = pathParts[0]; // 'history' 或 'health'
    const id = pathParts[1]; // 可选的 ID

    try {
        // ========== 健康检查 ==========
        if (resource === 'health') {
            const { error } = await supabaseClient
                .from('qr_history')
                .select('count')
                .limit(1);

            return res.json({
                success: true,
                status: 'healthy',
                database: error ? 'disconnected' : 'connected',
                timestamp: new Date().toISOString()
            });
        }

        // ========== 历史记录 API ==========
        if (resource === 'history') {

            // GET /api/history - 获取所有历史记录
            if (method === 'GET') {
                const { data, error } = await supabaseClient
                    .from('qr_history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) throw error;

                return res.json({
                    success: true,
                    data: data.map(item => ({
                        id: item.id,
                        text: item.content,
                        time: new Date(item.created_at).toLocaleTimeString('zh-CN'),
                        createdAt: item.created_at
                    }))
                });
            }

            // POST /api/history - 添加历史记录
            if (method === 'POST') {
                const { text } = req.body || {};

                if (!text || text.trim() === '') {
                    return res.status(400).json({ success: false, error: '内容不能为空' });
                }

                // 检查是否已存在相同记录
                const { data: existing } = await supabaseClient
                    .from('qr_history')
                    .select('id')
                    .eq('content', text.trim())
                    .limit(1);

                if (existing && existing.length > 0) {
                    // 更新已有记录的时间戳
                    const { data, error } = await supabaseClient
                        .from('qr_history')
                        .update({ created_at: new Date().toISOString() })
                        .eq('id', existing[0].id)
                        .select()
                        .single();

                    if (error) throw error;

                    return res.json({
                        success: true,
                        data: {
                            id: data.id,
                            text: data.content,
                            time: new Date(data.created_at).toLocaleTimeString('zh-CN'),
                            createdAt: data.created_at
                        },
                        isUpdate: true
                    });
                }

                // 插入新记录
                const { data, error } = await supabaseClient
                    .from('qr_history')
                    .insert([{ content: text.trim() }])
                    .select()
                    .single();

                if (error) throw error;

                return res.status(201).json({
                    success: true,
                    data: {
                        id: data.id,
                        text: data.content,
                        time: new Date(data.created_at).toLocaleTimeString('zh-CN'),
                        createdAt: data.created_at
                    }
                });
            }

            // DELETE /api/history/:id - 删除单条记录
            if (method === 'DELETE' && id) {
                const { error } = await supabaseClient
                    .from('qr_history')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                return res.json({ success: true, message: '删除成功' });
            }

            // DELETE /api/history - 清空所有记录
            if (method === 'DELETE' && !id) {
                const { error } = await supabaseClient
                    .from('qr_history')
                    .delete()
                    .neq('id', '00000000-0000-0000-0000-000000000000');

                if (error) throw error;

                return res.json({ success: true, message: '已清空所有记录' });
            }
        }

        // 未匹配到任何路由
        return res.status(404).json({ success: false, error: 'Not Found' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
