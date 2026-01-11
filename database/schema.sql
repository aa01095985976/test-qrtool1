-- =============================================
-- Supabase 数据库初始化脚本
-- QR Code Tool - 二维码生成工具
-- =============================================

-- 创建 qr_history 表
CREATE TABLE IF NOT EXISTS qr_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_qr_history_created_at 
ON qr_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qr_history_content 
ON qr_history(content);

-- 添加行级安全策略 (RLS)
-- 注意: 如果使用 service_role key，可跳过此步骤
-- 如果使用 anon key，需要配置 RLS

-- 启用 RLS
ALTER TABLE qr_history ENABLE ROW LEVEL SECURITY;

-- 允许所有操作 (适合演示用途，生产环境请根据需求调整)
CREATE POLICY "Allow all operations" ON qr_history
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================
-- 使用说明:
-- 1. 登录 Supabase Dashboard: https://supabase.com/dashboard
-- 2. 进入你的项目 -> SQL Editor
-- 3. 复制粘贴上述 SQL 并执行
-- 4. 或者使用 Table Editor 手动创建表
-- =============================================

-- 可选: 插入测试数据
-- INSERT INTO qr_history (content) VALUES 
--     ('https://github.com'),
--     ('Hello, World!'),
--     ('这是一个测试二维码');
