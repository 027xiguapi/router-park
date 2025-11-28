import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 JSON 数据
const jsonPath = path.join(__dirname, '../model/routers-merged-2025-11-28.json');
const routersData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 生成 slug (从 domain 或 mainUrl 生成 SEO 友好的标识符)
function generateSlug(domain: string): string {
  return domain
    .replace(/^www\./, '') // 移除 www.
    .replace(/^https?:\/\//, '') // 移除协议
    .replace(/\//g, '-') // 替换斜杠
    .replace(/[^a-z0-9-]/gi, '-') // 替换特殊字符
    .replace(/-+/g, '-') // 合并多个连字符
    .replace(/^-|-$/g, '') // 移除首尾连字符
    .toLowerCase();
}

// 生成 SEO 标题
function generateSeoTitle(name: string, domain: string): string {
  // 如果 name 包含具体描述,使用它;否则使用 domain
  if (name && name.length > 5 && !name.startsWith('http')) {
    return `${name} - AI中转服务`;
  }
  const domainName = domain.replace(/^www\./, '').split('.')[0];
  return `${domainName} - AI API 中转服务`;
}

// 生成 SEO 描述
function generateSeoDescription(data: any): string {
  const features: string[] = [];

  if (data.isVerified) {
    features.push('已验证');
  }
  if (data.totalLikes > 0) {
    features.push(`${data.totalLikes}人点赞`);
  }
  if (data.routerCount > 1) {
    features.push(`${data.routerCount}个路由`);
  }

  const baseDesc = `${data.name} 提供稳定的 AI 模型 API 中转服务`;
  const featuresDesc = features.length > 0 ? `,${features.join('、')}` : '';
  const inviteDesc = data.originalRouters[0]?.inviteLink ? ',注册即送额度' : '';

  return `${baseDesc}${featuresDesc}${inviteDesc}。`;
}

// 生成 Markdown 内容
function generateContent(data: any): string {
  let content = `# ${data.name}\n\n`;

  content += `## 服务信息\n\n`;
  content += `- **域名**: ${data.domain}\n`;
  content += `- **主链接**: ${data.mainUrl}\n`;
  content += `- **状态**: ${data.status === 'online' ? '在线' : '离线'}\n`;
  content += `- **验证状态**: ${data.isVerified ? '已验证 ✓' : '未验证'}\n`;
  content += `- **点赞数**: ${data.totalLikes}\n`;
  content += `- **路由数量**: ${data.routerCount}\n\n`;

  // 提取邀请链接
  const inviteLinks = data.originalRouters
    .filter((r: any) => r.inviteLink)
    .map((r: any) => r.inviteLink);

  if (inviteLinks.length > 0) {
    content += `## 邀请链接\n\n`;
    const uniqueInviteLinks = [...new Set(inviteLinks)];
    uniqueInviteLinks.forEach((link: string) => {
      content += `- [${link}](${link})\n`;
    });
    content += `\n`;
  }

  // 添加路由器信息
  if (data.originalRouters.length > 0) {
    content += `## 用户反馈\n\n`;
    data.originalRouters
      .filter((r: any) => r.name && r.name !== data.domain)
      .slice(0, 5) // 只显示前5条
      .forEach((router: any) => {
        content += `- **${router.name}** (${router.likes} 赞)\n`;
      });
  }

  return content;
}

// 提取支持的模型信息
function extractModels(data: any): string | null {
  // 从 name 和描述中提取常见的模型名称
  const modelKeywords = ['GPT-4', 'GPT-3.5', 'Claude', 'cc4.5', 'claude-3', 'Sonnet', 'Opus'];
  const foundModels: string[] = [];

  data.originalRouters.forEach((router: any) => {
    const text = `${router.name} ${data.name}`.toLowerCase();
    modelKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase()) && !foundModels.includes(keyword)) {
        foundModels.push(keyword);
      }
    });
  });

  return foundModels.length > 0 ? JSON.stringify(foundModels) : null;
}

// 生成 proxys 数据
const proxysData = routersData.map((data: any) => {
  const slug = generateSlug(data.domain);
  const seoTitle = generateSeoTitle(data.name, data.domain);
  const seoDescription = generateSeoDescription(data);
  const content = generateContent(data);
  const models = extractModels(data);
  const inviteLink = data.originalRouters[0]?.inviteLink || null;

  return {
    id: crypto.randomUUID(),
    name: data.name || data.domain,
    url: data.mainUrl,
    slug: slug,
    seoTitle: seoTitle,
    seoDescription: seoDescription,
    content: content,
    models: models,
    inviteLink: inviteLink,
    status: data.status === 'online' ? 'active' : 'inactive',
    sortOrder: data.totalLikes, // 使用 likes 作为排序依据
    views: 0,
    likes: data.totalLikes,
    createdBy: null, // 需要根据实际的 user ID 填充
  };
});

// 生成 SQL INSERT 语句
function generateSQL(proxysData: any[]): string {
  let sql = '-- Generated SQL for proxys table\n\n';

  proxysData.forEach((proxy) => {
    const values = [
      `'${proxy.id}'`,
      `'${proxy.name.replace(/'/g, "''")}'`,
      `'${proxy.url}'`,
      `'${proxy.slug}'`,
      `'${proxy.seoTitle.replace(/'/g, "''")}'`,
      `'${proxy.seoDescription.replace(/'/g, "''")}'`,
      `'${proxy.content.replace(/'/g, "''")}'`,
      proxy.models ? `'${proxy.models.replace(/'/g, "''")}'` : 'NULL',
      proxy.inviteLink ? `'${proxy.inviteLink}'` : 'NULL',
      `'${proxy.status}'`,
      proxy.sortOrder,
      proxy.views,
      proxy.likes,
      proxy.createdBy || 'NULL',
    ];

    sql += `INSERT INTO proxys (id, name, url, slug, seo_title, seo_description, content, models, invite_link, status, sort_order, views, likes, created_by)\n`;
    sql += `VALUES (${values.join(', ')});\n\n`;
  });

  return sql;
}

// 输出 JSON 格式
const outputJsonPath = path.join(__dirname, '../model/proxys-data.json');
fs.writeFileSync(outputJsonPath, JSON.stringify(proxysData, null, 2), 'utf-8');
console.log(`✅ JSON 数据已生成: ${outputJsonPath}`);
console.log(`   共生成 ${proxysData.length} 条记录`);

// 输出 SQL 格式
const outputSqlPath = path.join(__dirname, '../model/proxys-data.sql');
const sqlContent = generateSQL(proxysData);
fs.writeFileSync(outputSqlPath, sqlContent, 'utf-8');
console.log(`✅ SQL 数据已生成: ${outputSqlPath}`);

// 输出统计信息
console.log('\n📊 数据统计:');
console.log(`- 总记录数: ${proxysData.length}`);
console.log(`- 已验证: ${proxysData.filter((p: any) => p.status === 'active').length}`);
console.log(`- 有邀请链接: ${proxysData.filter((p: any) => p.inviteLink).length}`);
console.log(`- 总点赞数: ${proxysData.reduce((sum: number, p: any) => sum + p.likes, 0)}`);
