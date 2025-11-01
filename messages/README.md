# 国际化文件优化说明

## 概述

已成功将 messages 文件夹中的大型 JSON 文件拆分为模块化结构，提高代码可维护性和性能。

## 新文件结构

```
messages/
├── ar/                    # 阿拉伯语
│   ├── common.json        # 通用文本
│   ├── homepage.json      # 首页 (HomePage)
│   ├── login.json         # 登录相关
│   ├── footer.json        # 页脚
│   ├── headers.json       # 头部导航
│   ├── siteinfo.json      # 网站信息 (siteInfo)
│   ├── blog.json          # 单个博客
│   ├── blogs.json         # 博客列表
│   ├── plan.json          # 计划/套餐
│   ├── tokenpackage.json  # 令牌包 (tokenPackage)
│   ├── pricing.json       # 定价
│   ├── home.json          # 主页内容
│   └── index.js           # 合并所有模块
├── de/                    # 德语 (同样结构)
├── en/                    # 英语 (同样结构)
└── ... (其他8种语言)
```

## 支持的语言

- **ar** - 阿拉伯语
- **de** - 德语
- **en** - 英语
- **es** - 西班牙语
- **fr** - 法语
- **hi** - 印地语
- **it** - 意大利语
- **ja** - 日语
- **ko** - 韩语
- **pt** - 葡萄牙语
- **ru** - 俄语
- **zh** - 中文

## 优势

### 1. 模块化组织
- 每个功能模块独立文件，便于维护
- 开发者可以专注于特定功能的翻译

### 2. 按需加载 (未来优化)
```typescript
// 未来可以实现按需加载单个模块
const loginMessages = await import(`../messages/${locale}/login.json`);
```

### 3. 更好的团队协作
- 减少合并冲突
- 不同模块可以分配给不同的翻译人员

### 4. 性能提升
- 减少单个文件大小
- 未来可以配置只加载需要的模块

## 使用方法

### 在代码中访问翻译

与之前使用方式完全相同，next-intl 会自动从 index.js 加载：

```typescript
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('login');
  // 或
  const t = useTranslations();
  
  return <div>{t('login.signOut')}</div>;
}
```

### 访问不同模块

```typescript
const t = useTranslations('common');
console.log(t('close')); // "Close"

const t = useTranslations('home');
console.log(t('title')); // "Home Title"
```

## 更新的文件

1. **`i18n/request.ts`** - 更新消息加载路径为 `${locale}/index.js`
2. **`global.ts`** - 更新类型定义引用路径

## 模块列表

每个语言包含以下模块文件：

1. **common.json** - 通用文本（关闭、加载、保存等）
2. **homepage.json** - 首页文本
3. **login.json** - 登录相关文本
4. **footer.json** - 页脚文本
5. **headers.json** - 头部导航文本
6. **siteinfo.json** - 网站基本信息
7. **blog.json** - 单个博客页面
8. **blogs.json** - 博客列表页
9. **plan.json** - 套餐/计划详情
10. **tokenpackage.json** - 令牌包信息
11. **pricing.json** - 定价页面
12. **home.json** - 主页详细内容

## 添加新模块的步骤

1. 在原始 JSON 文件中添加新模块
2. 重新运行拆分脚本
3. 更新相关代码中的引用

## 注意事项

- `index.js` 文件是自动生成的，请勿手动修改
- 所有 JSON 文件使用 2 空格缩进
- 文件编码统一为 UTF-8
