-- 人生脚本 App - Supabase 数据库架构
-- 执行方式：在 Supabase SQL Editor 中粘贴此脚本并运行

-- ============================================
-- 用户配置表 (user_profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,

  -- 应用设置
  app_settings JSONB DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 确保每个用户只有一条配置记录
  UNIQUE(user_id)
);

-- ============================================
-- 用户数据表 (user_data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 应用数据（完整的应用状态）
  app_state JSONB NOT NULL DEFAULT '{}',

  -- 数据元数据
  data_type TEXT NOT NULL, -- 'app_state', 'backup', etc
  device_info TEXT,        -- 设备信息（用于识别不同设备）
  version INTEGER DEFAULT 1,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 数据同步日志表 (sync_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 同步信息
  action TEXT NOT NULL,     -- 'sync_push', 'sync_pull', 'merge'
  device_info TEXT,
  status TEXT,              -- 'success', 'conflict', 'error'

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引优化
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON public.user_data(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);

-- ============================================
-- 行级安全策略 (Row Level Security)
-- ============================================

-- 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- 用户配置表策略
CREATE POLICY "用户可以查看自己的配置"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的配置"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的配置"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户数据表策略
CREATE POLICY "用户可以查看自己的数据"
  ON public.user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的数据"
  ON public.user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的数据"
  ON public.user_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的数据"
  ON public.user_data FOR DELETE
  USING (auth.uid() = user_id);

-- 同步日志表策略
CREATE POLICY "用户可以查看自己的同步日志"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以插入自己的同步日志"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 自动更新 updated_at 的触发器
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 初始化完成
-- ============================================
-- 数据库架构已设置完成！
-- 下一步：在应用中配置 Supabase 客户端
