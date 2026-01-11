/**
 * QR Code Tool - Express 后端服务
 * 提供 RESTful API 与 Supabase 数据库交互
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ Supabase 初始化 ============
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 错误: 请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
    console.error('   参考 .env.example 文件进行配置');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============ 中间件 ============
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供前端页面
app.use(express.static(path.join(__dirname, '../public')));

// ============ API 路由 ============

/**
 * 获取所有历史记录
 * GET /api/history
 */
app.get('/api/history', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('qr_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({
            success: true,
            data: data.map(item => ({
                id: item.id,
                text: item.content,
                time: new Date(item.created_at).toLocaleTimeString('zh-CN'),
                createdAt: item.created_at
            }))
        });
    } catch (error) {
        console.error('获取历史记录失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 添加历史记录
 * POST /api/history
 * Body: { text: string }
 */
app.post('/api/history', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ success: false, error: '内容不能为空' });
        }

        // 检查是否已存在相同记录（防止重复）
        const { data: existing } = await supabase
            .from('qr_history')
            .select('id')
            .eq('content', text.trim())
            .limit(1);

        if (existing && existing.length > 0) {
            // 更新已有记录的时间戳（移到最前）
            const { data, error } = await supabase
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
        const { data, error } = await supabase
            .from('qr_history')
            .insert([{ content: text.trim() }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            data: {
                id: data.id,
                text: data.content,
                time: new Date(data.created_at).toLocaleTimeString('zh-CN'),
                createdAt: data.created_at
            }
        });
    } catch (error) {
        console.error('添加历史记录失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 删除单条历史记录
 * DELETE /api/history/:id
 */
app.delete('/api/history/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('qr_history')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除历史记录失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 清空所有历史记录
 * DELETE /api/history
 */
app.delete('/api/history', async (req, res) => {
    try {
        const { error } = await supabase
            .from('qr_history')
            .delete()
            .neq('id', 0); // 删除所有记录的技巧

        if (error) throw error;

        res.json({ success: true, message: '已清空所有记录' });
    } catch (error) {
        console.error('清空历史记录失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 健康检查端点
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
    try {
        // 测试数据库连接
        const { data, error } = await supabase
            .from('qr_history')
            .select('count')
            .limit(1);

        res.json({
            success: true,
            status: 'healthy',
            database: error ? 'disconnected' : 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

// ============ 启动服务器 ============
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════════╗');
        console.log('║       🎯 二维码生成工具 - 后端服务              ║');
        console.log('╠════════════════════════════════════════════════╣');
        console.log(`║  🚀 服务启动成功: http://localhost:${PORT}         ║`);
        console.log('║  📦 Supabase 数据库已连接                       ║');
        console.log('╚════════════════════════════════════════════════╝');
        console.log('');
    });
}

// 导出 app 供 Vercel 使用
module.exports = app;
