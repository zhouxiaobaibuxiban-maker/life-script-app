-- 清理用户云端数据
-- 使用说明：
-- 1. 打开 Supabase Dashboard → SQL Editor
-- 2. 点击 "New query"
-- 3. 复制下面的全部内容
-- 4. 粘贴并点击 Run

-- 查看当前数据（执行前可以先看看）
SELECT
  id,
  user_id,
  created_at,
  updated_at,
  app_state->>'userName' as user_name,
  CASE
    WHEN app_state->>'weeklyData' IS NOT NULL THEN '有数据'
    ELSE '无数据'
  END as data_status
FROM public.user_data
ORDER BY updated_at DESC;

-- 如果确认要删除，取消下面这行的注释：
-- DELETE FROM public.user_data WHERE user_id = '4918bd17-b9a2-466f-a178-3bc7fd210819';

-- 删除后验证（应该显示 no rows）
-- SELECT * FROM public.user_data WHERE user_id = '4918bd17-b9a2-466f-a178-3bc7fd210819';
