import { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './language.js'

const storageKey = 'forep_language'
const supportedLanguages = ['en', 'vi']

const dictionary = {
  en: {
    common: {
      create: 'Create',
      refresh: 'Refresh',
      search: 'Search',
      settings: 'Settings',
      notifications: 'Notifications',
      openRoleModule: 'Open role module',
      signOut: 'Sign out',
      language: 'Language',
      english: 'English',
      vietnamese: 'Vietnamese',
    },
    auth: {
      platform: 'AI Workforce Intelligence Platform',
      welcomeBack: 'Welcome back',
      loginDescription: 'Sign in to continue to your workforce intelligence workspace.',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      passwordRecoverySoon: 'Password recovery will be available soon.',
      signIn: 'Sign in',
      signingIn: 'Signing in...',
      noAccount: "Don't have an account?",
      createAccount: 'Create account',
      createTitle: 'Create your account',
      registerDescription: 'Create a FOREP workspace account for your organization.',
      firstName: 'First name',
      lastName: 'Last name',
      confirmPassword: 'Confirm password',
      role: 'Role',
      selectRole: 'Select role',
      alreadyAccount: 'Already have an account?',
      roleHelp: 'Your selected role determines which FOREP workspace opens after sign in.',
      creatingAccount: 'Creating account...',
      accountCreated: 'Account created. Please sign in.',
    },
    nav: {
      Dashboard: 'Dashboard',
      Organizations: 'Organizations',
      Organization: 'Organization',
      Users: 'Users',
      Teams: 'Teams',
      Employees: 'Employees',
      Tasks: 'Tasks',
      Sprints: 'Sprints',
      'Event Timeline': 'Event Timeline',
      Analytics: 'Analytics',
      'Team Analytics': 'Team Analytics',
      'People Analytics': 'People Analytics',
      'Personal Analytics': 'Personal Analytics',
      'AI Insights': 'AI Insights',
      Integrations: 'Integrations',
      'System Monitoring': 'System Monitoring',
      Attendance: 'Attendance',
      'Leave Requests': 'Leave Requests',
      Reports: 'Reports',
      Recruitment: 'Recruitment',
      Notifications: 'Notifications',
      Profile: 'Profile',
      'Team Tasks': 'Team Tasks',
      'Task Overview': 'Task Overview',
      'My Tasks': 'My Tasks',
    },
    titles: {
      Dashboard: 'Dashboard',
      Tasks: 'Tasks',
      Employees: 'Employees',
      Teams: 'Teams',
      Sprints: 'Sprints',
      'Events Timeline': 'Events Timeline',
      Analytics: 'Analytics',
      'AI Insights': 'AI Insights',
      Attendance: 'Attendance',
      'Leave Requests': 'Leave Requests',
      Notifications: 'Notifications',
      Settings: 'Settings',
      Organizations: 'Organizations',
      Users: 'Users',
      Integrations: 'Integrations',
      'System Monitoring': 'System Monitoring',
      Reports: 'Reports',
      Recruitment: 'Recruitment',
      Profile: 'Profile',
    },
    search: {
      admin: 'Search organizations, users, integrations...',
      manager: 'Search tasks, employees, events...',
      hr: 'Search employees, leave requests, attendance...',
      employee: 'Search my tasks, activity, leave...',
    },
    settings: {
      title: 'Product Configuration',
      description: 'Configuration placeholders prepared for backend administration features.',
      appearance: 'Appearance',
      appearanceDescription: 'Choose how FOREP appears on this device.',
      languageTitle: 'Language',
      languageDescription: 'Choose English or Vietnamese for the product interface on this device.',
      profile: 'Profile',
      profileDescription: 'Update your personal employee profile from the backend account API.',
      refresh: 'Refresh',
      saveProfile: 'Save Profile',
      saving: 'Saving...',
      loadingProfile: 'Loading profile',
      readingProfile: 'Reading your profile from the backend.',
      unableProfile: 'Unable to load profile',
      profileUnavailable: 'Profile data is not available.',
      profileUnavailableDescription: 'Please check authentication or retry after the backend returns the employee profile.',
      futureConfig: 'This configuration area will be connected to backend administration APIs later.',
    },
    landing: {
      platform: 'AI Workforce Intelligence Platform',
      headline: 'Reveal workforce risk before it becomes operational drag.',
      trust: 'Not a surveillance tool. A transparency tool.',
      description: 'FOREP turns fragmented task, attendance, leave and performance signals into one intelligent workforce timeline so leaders can act before risk becomes escalation.',
      login: 'Login',
      explore: 'Explore Features',
      liveSignals: 'Live Workforce Signals',
      signalDescription: 'Operational events flowing into FOREP',
      aiReady: 'AI READY',
    },
  },
  vi: {
    common: {
      create: 'Tạo mới',
      refresh: 'Làm mới',
      search: 'Tìm kiếm',
      settings: 'Cài đặt',
      notifications: 'Thông báo',
      openRoleModule: 'Mở chức năng theo vai trò',
      signOut: 'Đăng xuất',
      language: 'Ngôn ngữ',
      english: 'Tiếng Anh',
      vietnamese: 'Tiếng Việt',
    },
    auth: {
      platform: 'Nền tảng AI Workforce Intelligence',
      welcomeBack: 'Chào mừng trở lại',
      loginDescription: 'Đăng nhập để tiếp tục vào không gian quản trị workforce intelligence.',
      email: 'Email',
      password: 'Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      passwordRecoverySoon: 'Tính năng khôi phục mật khẩu sẽ có sau.',
      signIn: 'Đăng nhập',
      signingIn: 'Đang đăng nhập...',
      noAccount: 'Chưa có tài khoản?',
      createAccount: 'Tạo tài khoản',
      createTitle: 'Tạo tài khoản',
      registerDescription: 'Tạo tài khoản FOREP cho workspace tổ chức của bạn.',
      firstName: 'Tên',
      lastName: 'Họ',
      confirmPassword: 'Xác nhận mật khẩu',
      role: 'Vai trò',
      selectRole: 'Chọn vai trò',
      alreadyAccount: 'Đã có tài khoản?',
      roleHelp: 'Vai trò đã chọn quyết định workspace FOREP được mở sau khi đăng nhập.',
      creatingAccount: 'Đang tạo tài khoản...',
      accountCreated: 'Tạo tài khoản thành công. Vui lòng đăng nhập.',
    },
    nav: {
      Dashboard: 'Dashboard',
      Organizations: 'Tổ chức',
      Organization: 'Tổ chức',
      Users: 'Người dùng',
      Teams: 'Đội nhóm',
      Employees: 'Nhân sự',
      Tasks: 'Công việc',
      Sprints: 'Sprint',
      'Event Timeline': 'Dòng sự kiện',
      Analytics: 'Phân tích',
      'Team Analytics': 'Phân tích đội nhóm',
      'People Analytics': 'Phân tích nhân sự',
      'Personal Analytics': 'Phân tích cá nhân',
      'AI Insights': 'AI Insights',
      Integrations: 'Tích hợp',
      'System Monitoring': 'Giám sát hệ thống',
      Attendance: 'Chấm công',
      'Leave Requests': 'Nghỉ phép',
      Reports: 'Báo cáo',
      Recruitment: 'Tuyển dụng',
      Notifications: 'Thông báo',
      Profile: 'Hồ sơ',
      'Team Tasks': 'Công việc đội nhóm',
      'Task Overview': 'Tổng quan công việc',
      'My Tasks': 'Công việc của tôi',
    },
    titles: {
      Dashboard: 'Dashboard',
      Tasks: 'Công việc',
      Employees: 'Nhân sự',
      Teams: 'Đội nhóm',
      Sprints: 'Sprint',
      'Events Timeline': 'Dòng sự kiện',
      Analytics: 'Phân tích',
      'AI Insights': 'AI Insights',
      Attendance: 'Chấm công',
      'Leave Requests': 'Nghỉ phép',
      Notifications: 'Thông báo',
      Settings: 'Cài đặt',
      Organizations: 'Tổ chức',
      Users: 'Người dùng',
      Integrations: 'Tích hợp',
      'System Monitoring': 'Giám sát hệ thống',
      Reports: 'Báo cáo',
      Recruitment: 'Tuyển dụng',
      Profile: 'Hồ sơ',
    },
    search: {
      admin: 'Tìm tổ chức, người dùng, tích hợp...',
      manager: 'Tìm công việc, nhân sự, sự kiện...',
      hr: 'Tìm nhân sự, nghỉ phép, chấm công...',
      employee: 'Tìm công việc, hoạt động, nghỉ phép của tôi...',
    },
    settings: {
      title: 'Cấu hình sản phẩm',
      description: 'Các khu vực cấu hình đã chuẩn bị cho API quản trị backend.',
      appearance: 'Giao diện',
      appearanceDescription: 'Chọn cách FOREP hiển thị trên thiết bị này.',
      languageTitle: 'Ngôn ngữ',
      languageDescription: 'Chọn tiếng Anh hoặc tiếng Việt cho giao diện sản phẩm trên thiết bị này.',
      profile: 'Hồ sơ',
      profileDescription: 'Cập nhật hồ sơ nhân sự cá nhân từ API tài khoản backend.',
      refresh: 'Làm mới',
      saveProfile: 'Lưu hồ sơ',
      saving: 'Đang lưu...',
      loadingProfile: 'Đang tải hồ sơ',
      readingProfile: 'Đang đọc hồ sơ của bạn từ backend.',
      unableProfile: 'Không tải được hồ sơ',
      profileUnavailable: 'Chưa có dữ liệu hồ sơ.',
      profileUnavailableDescription: 'Vui lòng kiểm tra đăng nhập hoặc thử lại sau khi backend trả hồ sơ nhân sự.',
      futureConfig: 'Khu vực cấu hình này sẽ được nối với API quản trị backend sau.',
    },
    landing: {
      platform: 'Nền tảng AI Workforce Intelligence',
      headline: 'Nhìn thấy rủi ro workforce trước khi nó thành áp lực vận hành.',
      trust: 'Không phải công cụ giám sát. Đây là công cụ minh bạch.',
      description: 'FOREP kết nối tín hiệu rời rạc từ task, chấm công, nghỉ phép và hiệu suất thành một timeline workforce thông minh để đội ngũ quản lý hành động trước khi rủi ro leo thang.',
      login: 'Đăng nhập',
      explore: 'Khám phá tính năng',
      liveSignals: 'Tín hiệu workforce trực tiếp',
      signalDescription: 'Operational events đang chảy vào FOREP',
      aiReady: 'AI SẴN SÀNG',
    },
  },
}

function readInitialLanguage() {
  const stored = localStorage.getItem(storageKey)
  if (supportedLanguages.includes(stored)) return stored
  return 'en'
}

function lookup(language, key) {
  return key.split('.').reduce((current, part) => current?.[part], dictionary[language])
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((nextLanguage) => {
    if (!supportedLanguages.includes(nextLanguage)) return
    localStorage.setItem(storageKey, nextLanguage)
    setLanguageState(nextLanguage)
    document.documentElement.lang = nextLanguage
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'vi' : 'en')
  }, [language, setLanguage])

  const t = useCallback((key, fallback) => lookup(language, key) ?? fallback ?? key, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t,
  }), [language, setLanguage, t, toggleLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
