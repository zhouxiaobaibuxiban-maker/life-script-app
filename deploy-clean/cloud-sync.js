/**
 * 人生脚本 App - 云端同步模块
 * 使用 Supabase 实现数据同步和用户认证
 *
 * 配置步骤：
 * 1. 注册 Supabase: https://supabase.com
 * 2. 创建项目，获取 API URL 和 anon key
 * 3. 在 SQL Editor 中执行 supabase/schema.sql
 * 4. 在 index.html 中配置 SUPABASE_CONFIG
 *
 * @version 2.3 - 修复了 updated_at 手动设置导致上传失败的问题
 */

console.log('🔧 cloud-sync.js v2.3 已加载');

// ========== Supabase 客户端 ==========
let supabaseClient = null;
let currentUser = null;
let isCloudEnabled = false;

// ========== 初始化 Supabase ==========
function initSupabase() {
  try {
    // 检查是否配置了 Supabase
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('your-project')) {
      console.log('⚠️ Supabase 未配置，使用本地模式');
      return false;
    }

    // 检查 Supabase SDK 是否已加载
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase SDK 未加载');
      return false;
    }

    // 初始化 Supabase 客户端
    supabaseClient = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    console.log('✅ Supabase SDK 已加载');

    // 检查登录状态
    checkAuthState();

    return true;
  } catch (error) {
    console.error('❌ Supabase 初始化失败:', error);
    return false;
  }
}

// ========== 认证功能 ==========

/**
 * 检查用户登录状态
 */
async function checkAuthState() {
  if (!supabaseClient) return;

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
      currentUser = session.user;
      console.log('✅ 用户已登录:', currentUser.email);
      showUserLoggedIn();

      // 隐藏引导层（已登录用户不需要看引导）
      const introLayer = document.getElementById('intro-layer');
      if (introLayer) {
        introLayer.style.display = 'none';
        introLayer.classList.add('hide');
        console.log('✅ 已隐藏引导层');
      }

      // 自动同步数据（静默，不弹窗）
      await syncDataFromCloud();

      // 通知主应用初始化完成
      if (typeof window.onCloudSyncReady === 'function') {
        window.onCloudSyncReady();
      }
    } else {
      currentUser = null;
      console.log('ℹ️ 未登录');
      showLoginRequired();
    }
  } catch (error) {
    console.error('❌ 检查登录状态失败:', error);
  }
}

/**
 * 邮箱登录/注册
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 */
async function signInWithEmail(email, password) {
  if (!supabaseClient) {
    alert('云服务未配置');
    return false;
  }

  try {
    // 先尝试登录
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      // 如果登录失败，提供清晰的错误提示
      if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
        // 显示友好的错误提示
        alert('登录失败，可能是以下原因：\n\n1. 密码错误\n2. 邮箱未验证（请检查邮箱确认链接）\n\n如果是新用户，请直接输入邮箱和密码进行注册。');
        return false;
      }
      throw error;
    }

    if (data.user) {
      currentUser = data.user;
      console.log('✅ 登录成功');
      console.log('用户ID:', currentUser.id);
      console.log('邮箱:', currentUser.email);

      // 登录成功后先隐藏登录框
      hideLoginModal();
      showUserLoggedIn();

      // 隐藏引导层（已登录用户不需要看引导）
      const introLayer = document.getElementById('intro-layer');
      if (introLayer) {
        introLayer.style.display = 'none';
        introLayer.classList.add('hide');
        console.log('✅ 已隐藏引导层');
      }

      // 显示登录成功提示
      showSyncSuccess('登录成功！正在检查云端数据...');

      // 登录成功后立即从云端同步数据
      // 这会自动处理：有云端数据就下载，没有就询问是否上传本地数据
      await syncDataFromCloud();

      // 通知主应用初始化完成
      if (typeof window.onCloudSyncReady === 'function') {
        window.onCloudSyncReady();
      }

      return true;
    }
  } catch (error) {
    console.error('❌ 登录失败:', error);
    alert('登录失败: ' + error.message);
    return false;
  }
}

/**
 * 邮箱注册
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 */
async function signUpWithEmail(email, password) {
  if (!supabaseClient) {
    alert('云服务未配置');
    return false;
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // 检查是否需要验证
      if (data.user.identities?.length === 0) {
        alert('该邮箱已注册，请直接登录');
        return false;
      }

      currentUser = data.user;
      console.log('✅ 注册成功');
      hideLoginModal();
      showUserLoggedIn();

      // 隐藏引导层
      const introLayer = document.getElementById('intro-layer');
      if (introLayer) {
        introLayer.style.display = 'none';
        introLayer.classList.add('hide');
      }

      // 新用户注册成功，显示提示
      showSyncSuccess('注册成功！请设置您的姓名开始使用');

      // 通知主应用初始化完成
      if (typeof window.onCloudSyncReady === 'function') {
        window.onCloudSyncReady();
      }

      return true;
    }
  } catch (error) {
    console.error('❌ 注册失败:', error);
    alert('注册失败: ' + error.message);
    return false;
  }
}

/**
 * 退出登录
 */
async function signOut() {
  if (!supabaseClient) return;

  try {
    await supabaseClient.auth.signOut();
    currentUser = null;
    console.log('✅ 已退出登录');
    showLoginRequired();
  } catch (error) {
    console.error('❌ 退出登录失败:', error);
  }
}

// ========== 数据同步功能 ==========

/**
 * 从云端同步数据
 */
async function syncDataFromCloud() {
  console.log('🔄 开始从云端同步数据...');
  console.log('currentUser:', currentUser ? currentUser.id : 'null');
  console.log('supabaseClient:', supabaseClient ? 'OK' : 'null');

  if (!currentUser || !supabaseClient) {
    console.log('❌ 无法同步：未登录或客户端未初始化');
    return;
  }

  try {
    console.log('📡 查询云端数据，user_id:', currentUser.id);
    const { data, error } = await supabaseClient
      .from('user_data')
      .select('app_state, updated_at')
      .eq('user_id', currentUser.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('查询结果:', data ? '有数据' : '无数据', error ? '有错误' : '无错误');

    if (error) {
      console.error('❌ 查询云端数据失败:', error);
      throw error;
    }

    // 检查是否有数据
    if (!data || !data.app_state) {
      console.log('ℹ️ 云端无数据，准备上传本地数据');
      await checkAndUploadLocalData();
      return;
    }

    const cloudState = data.app_state;
    console.log('✅ 找到云端数据');
    console.log('🔍 云端数据结构:', {
      userName: cloudState.userName || '(无)',
      hasWeeklyData: !!(cloudState.weeklyData),
      weeklyDataKeys: cloudState.weeklyData ? Object.keys(cloudState.weeklyData) : [],
      hasCategories: !!(cloudState.categories)
    });

    // 自动修复：如果云端数据有数据但 userName 为空，说明是之前上传失败的残留数据，自动清理
    const hasDataContent = (cloudState.weeklyData && Object.keys(cloudState.weeklyData).length > 0) ||
                           (cloudState.categories && Object.keys(cloudState.categories).length > 0);

    if (hasDataContent && !cloudState.userName) {
      console.log('⚠️ 检测到无效云端数据（有内容但无 userName），自动清理中...');
      const { error: deleteError } = await supabaseClient
        .from('user_data')
        .delete()
        .eq('user_id', currentUser.id);

      if (!deleteError) {
        console.log('✅ 已清理无效云端数据');
      } else {
        console.error('❌ 清理失败:', deleteError);
      }
      // 清理后，检查本地数据并上传
      await checkAndUploadLocalData();
      return;
    }

    // 检查云端数据是否有实际内容
    // 只要 weeklyData 或 categories 有数据就认为有效，不强制要求 userName
    const hasRealCloudData = (cloudState.weeklyData && Object.keys(cloudState.weeklyData).length > 0) ||
                              (cloudState.categories && Object.keys(cloudState.categories).length > 0);

    if (!hasRealCloudData) {
      console.log('ℹ️ 云端数据为空，检查本地数据...');
      await checkAndUploadLocalData();
      return;
    }

    console.log('✅ 云端有有效数据');

    const cloudUpdatedAt = new Date(data.updated_at);
    const localUpdatedAt = localStorage.getItem('lastSyncAt')
      ? new Date(localStorage.getItem('lastSyncAt'))
      : new Date(0);

    console.log('🕐 云端时间:', cloudUpdatedAt.toISOString(), '本地时间:', localUpdatedAt.toISOString());

    // 检查本地数据是否完整
    const localHasRealData = window.appState &&
                             (window.appState.weeklyData && Object.keys(window.appState.weeklyData).length > 0);

    // 检查本地用户名是否有效（不是默认值）
    const localUserNameValid = window.appState &&
                               window.appState.userName &&
                               window.appState.userName !== '周小白';

    console.log('📊 本地状态:', {
      hasRealData: localHasRealData,
      userNameValid: localUserNameValid,
      userName: window.appState?.userName || '(未设置)'
    });

    // 决定是否需要合并：
    // 1. 云端数据更新
    // 2. 本地数据不完整
    // 3. 本地用户名无效（还是默认值）但云端有数据
    const shouldMerge = cloudUpdatedAt > localUpdatedAt ||
                       !localHasRealData ||
                       (!localUserNameValid && hasRealCloudData);

    if (shouldMerge) {
      // 云端数据更新，下载并合并
      if (!localHasRealData) {
        console.log('⬇️ 本地数据不完整，使用云端数据...');
      } else if (!localUserNameValid && hasRealCloudData) {
        console.log('⬇️ 本地用户名无效，从云端获取...');
      } else {
        console.log('⬇️ 云端数据更新，开始合并...');
      }
      await mergeDataFromCloud(cloudState);
      localStorage.setItem('lastSyncAt', new Date().toISOString()); // 使用当前时间作为同步时间
      console.log('✅ 数据已从云端同步');
      showSyncSuccess(`已从云端同步 (${window.appState.userName}的数据)`);
    } else {
      console.log('ℹ️ 本地数据已是最新');
    }
  } catch (error) {
    console.error('❌ 同步数据失败:', error);
  }
}

/**
 * 上传数据到云端
 */
async function uploadDataToCloud() {
  if (!currentUser || !supabaseClient) {
    console.log('ℹ️ 未登录，跳过云端同步');
    return false;
  }

  // 如果正在同步，跳过上传防止循环
  if (isSyncing) {
    console.log('ℹ️ 正在同步中，跳过上传');
    return false;
  }

  try {
    // 检查云端是否已有数据
    const { data: existing } = await supabaseClient
      .from('user_data')
      .select('id, version, app_state')
      .eq('user_id', currentUser.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    // 如果云端有数据但本地没有完整数据，先从云端同步
    if (existing && existing.length > 0 && existing[0].app_state) {
      const cloudData = existing[0].app_state;
      const hasLocalData = window.appState && window.appState.userName;

      // 如果本地没有有效数据，直接使用云端数据
      if (!hasLocalData || !window.appState.categories) {
        console.log('ℹ️ 云端有数据，本地数据不完整，使用云端数据');
        await mergeDataFromCloud(cloudData);
        localStorage.setItem('lastSyncAt', new Date().toISOString());
        return true;
      }
    }

    const appState = {
      ...window.appState,
      _syncedAt: new Date().toISOString(),
      _deviceInfo: navigator.userAgent
    };

    console.log('📤 准备上传数据，user_id:', currentUser.id);
    console.log('📤 appState.userName:', appState.userName);

    let result;
    if (existing && existing.length > 0) {
      // 更新现有数据 - 不手动设置 updated_at，让 Supabase 自动管理
      console.log('📤 更新现有数据，ID:', existing[0].id);
      result = await supabaseClient
        .from('user_data')
        .update({
          app_state: appState,
          version: existing[0].version + 1
          // 不设置 updated_at，Supabase 会自动更新
        })
        .eq('id', existing[0].id)
        .select();

      if (result.error) throw result.error;
      console.log('✅ 更新成功，数据 ID:', result.data[0].id);
    } else {
      // 插入新数据
      console.log('📤 插入新数据');
      result = await supabaseClient
        .from('user_data')
        .insert({
          user_id: currentUser.id,
          app_state: appState,
          data_type: 'app_state',
          device_info: navigator.userAgent
        })
        .select();

      if (result.error) throw result.error;
      console.log('✅ 插入成功，数据 ID:', result.data[0].id);
    }

    localStorage.setItem('lastSyncAt', new Date().toISOString());
    console.log('✅ 数据已上传到云端');
    showSyncSuccess('已同步到云端');
    return true;
  } catch (error) {
    console.error('❌ 上传数据失败:', error);
    showSyncError('同步失败: ' + error.message);
    return false;
  }
}

// 防止同步循环的标志
let isSyncing = false;

/**
 * 合并云端数据到本地
 */
async function mergeDataFromCloud(cloudState) {
  if (isSyncing) {
    console.log('ℹ️ 正在同步中，跳过重复同步');
    return;
  }

  try {
    isSyncing = true;

    console.log('🔧 mergeDataFromCloud 开始, cloudState.userName:', cloudState.userName);
    console.log('📧 当前用户邮箱:', currentUser?.email);

    // 如果云端数据没有用户名，使用邮箱作为默认用户名
    if (!cloudState.userName || cloudState.userName === '周小白') {
      if (currentUser && currentUser.email) {
        // 从邮箱提取用户名（@之前的部分）
        const emailName = currentUser.email.split('@')[0];
        cloudState.userName = emailName;
        console.log('✅ 使用邮箱作为用户名:', emailName);
      } else {
        cloudState.userName = '用户';
        console.log('⚠️ 无法获取邮箱，使用默认用户名');
      }
    }

    console.log('✅ 最终 userName:', cloudState.userName);

    // 云端数据完全覆盖本地数据
    window.appState = { ...cloudState };

    // 直接保存到 localStorage，不触发上传
    localStorage.setItem('lifeScriptAppState', JSON.stringify(window.appState));
    localStorage.setItem('lifeScriptData', JSON.stringify(window.appState));

    // 刷新界面 - 需要调用多个刷新函数
    if (typeof window.renderWeekTable === 'function') {
      window.renderWeekTable();
    }
    if (typeof window.updateUserName === 'function') {
      window.updateUserName();
    }
    if (typeof window.updateWeekInfo === 'function') {
      window.updateWeekInfo();
    }
    if (typeof window.renderCategorySelector === 'function') {
      window.renderCategorySelector();
    }
    if (typeof window.renderCheckinList === 'function') {
      window.renderCheckinList();
    }
    if (typeof window.renderCategoryConfig === 'function') {
      window.renderCategoryConfig();
    }

    console.log('✅ 数据已从云端合并到本地');
    console.log('用户名:', window.appState.userName || '(未设置)');

    // 延迟重置标志，防止立即再次触发
    setTimeout(() => {
      isSyncing = false;
    }, 2000);
  } catch (error) {
    console.error('❌ 合并数据失败:', error);
    isSyncing = false;
  }
}

/**
 * 检查并上传本地数据（首次使用）
 */
async function checkAndUploadLocalData() {
  const localData = localStorage.getItem('lifeScriptAppState');

  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      // 检查本地数据是否有实际内容（不只是默认值）
      // 只要有 weeklyData 或 categories 就认为有数据
      const hasRealData = (parsed.weeklyData && Object.keys(parsed.weeklyData).length > 0) ||
                          (parsed.categories && Object.keys(parsed.categories).length > 0);

      if (hasRealData) {
        const hasData = confirm('检测到本地已有数据，是否上传到云端？\n\n点击"确定"上传，点击"取消"使用云端数据');

        if (hasData) {
          await uploadDataToCloud();
        } else {
          await syncDataFromCloud();
        }
      } else {
        // 本地数据是空的或只有默认值，直接从云端同步
        console.log('ℹ️ 本地数据为空，等待云端数据...');
      }
    } catch (e) {
      console.error('❌ 解析本地数据失败:', e);
    }
  } else {
    // 没有本地数据
    console.log('ℹ️ 没有本地数据');
  }
}

// ========== UI 功能 ==========

/**
 * 显示登录界面
 */
function showLoginRequired() {
  // 创建登录模态框
  let modal = document.getElementById('loginModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.innerHTML = `
      <div class="login-overlay" onclick="hideLoginModal()"></div>
      <div class="login-container">
        <div class="login-logo">🎬 人生脚本</div>
        <div class="login-title">登录云端同步</div>
        <div class="login-desc">登录后数据自动同步，多设备无缝使用</div>

        <form onsubmit="handleLogin(event)" class="login-form">
          <div class="form-group">
            <label>邮箱</label>
            <input type="email" id="loginEmail" placeholder="请输入邮箱" required>
          </div>

          <div class="form-group">
            <label>密码</label>
            <input type="password" id="loginPassword" placeholder="请输入密码" required
              minlength="6">
          </div>

          <button type="submit" class="login-btn">登录 / 注册</button>

          <div class="login-tips">
            <p>💡 首次使用将自动注册账号</p>
            <p>🔒 数据加密存储，仅你能访问</p>
          </div>

          <button type="button" onclick="useLocalMode()" class="local-mode-btn">
            暂不登录，使用本地模式
          </button>
        </form>
      </div>

      <style>
        #loginModal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }

        .login-container {
          position: relative;
          width: 90%;
          max-width: 360px;
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-logo {
          font-size: 48px;
          text-align: center;
          margin-bottom: 10px;
        }

        .login-title {
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 8px;
          color: #2C2C2C;
        }

        .login-desc {
          font-size: 13px;
          color: #8B8B8B;
          text-align: center;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #2C2C2C;
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #E5E3DC;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .login-btn:hover {
          background: #5568d3;
          transform: translateY(-1px);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-tips {
          font-size: 12px;
          color: #999;
          text-align: center;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .local-mode-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          color: #8B8B8B;
          border: 1px solid #E5E3DC;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .local-mode-btn:hover {
          background: #f5f5f5;
        }
      </style>
    `;

    document.body.appendChild(modal);
  }

  modal.style.display = 'flex';
}

/**
 * 隐藏登录界面
 */
function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * 处理登录提交
 */
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const success = await signInWithEmail(email, password);

  if (success) {
    hideLoginModal();
  }
}

/**
 * 显示已登录状态
 */
function showUserLoggedIn() {
  // 显示云同步按钮
  const syncBtn = document.getElementById('cloudSyncBtn');
  if (syncBtn) {
    syncBtn.style.display = 'flex';
  }
}

/**
 * 使用本地模式
 */
function useLocalMode() {
  hideLoginModal();
  console.log('ℹ️ 使用本地模式，数据不会同步到云端');
}

/**
 * 显示同步成功提示
 */
function showSyncSuccess(message) {
  showToast(message || '✅ 同步成功');
}

/**
 * 显示同步错误提示
 */
function showSyncError(message) {
  showToast(message || '❌ 同步失败');
}

/**
 * 显示提示消息
 */
function showToast(message, duration = 2000) {
  let toast = document.getElementById('syncToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'syncToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 14px;
      z-index: 10001;
      animation: fadeIn 0.3s;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

// ========== 导出模块 ==========
// 这些函数将在全局作用域中可用
window.CloudSync = {
  init: initSupabase,
  signIn: signInWithEmail,
  signUp: signUpWithEmail,
  signOut: signOut,
  upload: uploadDataToCloud,
  sync: syncDataFromCloud,
  getCurrentUser: () => currentUser,
  isReady: () => !!supabaseClient && !!currentUser,
  getClient: () => supabaseClient,  // 添加客户端访问
  merge: mergeDataFromCloud  // 添加合并函数访问
};

// 自动初始化（如果配置了 Supabase）
// 立即初始化，不等待 DOMContentLoaded，以确保在主应用 init 之前完成
const isConfigured = initSupabase();
isCloudEnabled = isConfigured;
